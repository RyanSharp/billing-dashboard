from webapp import RequestHandler, WSGIApplication
from google.appengine.ext.key_range import ndb
from models.entities import OauthCredentials, OauthSession
from classes.account import get_account_by_id
from utils.decorators import login_required
from utils.auth import check_access_level, check_if_login_correct, get_server_auth, Auth
from utils import constants
import datetime
import hashlib
import urllib
import json
import uuid


EXPIRATION = 60  # seconds before CSRF token expiration
CODE_EXPIRATION = 15  # seconds before Oauth code expires
TOKEN_EXPIRATION = 3600  # seconds before oauth token expires


def check_auth_token(handler):
    authorization = handler.headers.get("Authorization")
    if not authorization:
        return False
    authorization = authorization.split(" ")
    if authorization[0] != "Bearer":
        return False
    session = OauthSession.query(OauthSession.auth_token == authorization[1]).get()
    if not session:
        return False
    acct = get_account_by_id(get_server_auth(), session.account_id)
    handler.auth = Auth(acct)
    return True

class StartOauthFlow(RequestHandler):
    '''
        Starts authenication flow, loads credentials based on provided
        If already have session active for user, verify access level is correct and redirect with code
        If not active session, render login page to grant oauth access

        WARNING: SECURITY RISK
        If using this tool to authorize third party applications, do not automatically grant oauth access
        if the user is already logged in (ie. do not redirect without user input)
        I developed this for my own purposes where only trusted partners would be provided credentials
        and the applications requesting and granting access exist within the same suite
    '''
    def run_redirect(self):
        session = OauthSession(client_id=self.credentials.client_id,
                               auth_token=hashlib.sha512(uuid.uuid4().hex).hexdigest(),
                               ip_address=self.request.remote_addr,
                               user_agent=self.request.headers.get("User-Agent", None),
                               account_id=self.auth.user()._get_id_field(),
                               group_id=self.auth.get_group_id(),
                               code=uuid.uuid4().hex,
                               activated=False)
        session.put()
        params = {"code": session.code}
        self.redirect("{0}?{1}".format(self.credentials.redirect_uri, urllib.urlencode(params)))

    @login_required()
    def get(self):
        client_id = self.request.get("client_id")
        credentials = OauthCredentials.query(OauthCredentials.client_id == client_id).get()
        if credentials:
            self.credentials = credentials
            redirect_uri = urllib.url2pathname(self.request.get("redirect_uri"))
            if redirect_uri == credentials.redirect_uri:
                if hasattr(self, "auth") and check_access_level(self.auth, constants._ADMIN):
                    self.run_redirect()
                else:
                    credentials.middleware_token = uuid.uuid4().hex
                    credentials.put()
                    template_args = {
                        "csrf_token": credentials.middleware_token,
                        "app_identity": credentials.client_id,
                        "redirect_uri": credentials.redirect_uri,
                    }
            else:
                self.response.write("Invalid redirect uri")
                self.response.status = 400
        else:
            self.response.write("Invalid client ID")
            self.response.status = 400

    def post(self):
        redirect_uri = self.request.POST.get("redirect_uri")
        client_id = self.request.POST.get("app_identity")
        middleware_token = self.request.POST.get("csrf_token")
        username = self.request.POST.get("username")
        password = self.request.POST.get("password")
        credentials = OauthCredentials.query(OauthCredentials.client_id == client_id).get()
        if credentials:
            self.credentials = credentials
            if credentials.redirect_uri == redirect_uri and\
                    credentials.middleware_token == middleware_token:
                if (datetime.datetime.now() - credentials.modified).total_seconds() <= EXPIRATION:
                    if check_if_login_correct(username, password):
                        self.run_redirect()
                    else:
                        self.response.write("Username password combination incorrect")
                        self.response.status = 400
                else:
                    self.response.write("Oauth handshake expired, please restart flow")
                    self.response.status = 400
            else:
                self.response.write("Session could not be validated")
                self.response.status = 400
        else:
            self.response.write("Invalid client ID")
            self.response.status = 400


class ExchangeOauthCode(RequestHandler):
    def post(self):
        rdict = {"success": False}
        session = OauthSession.query(OauthSession.code == self.request.get("code")).get()
        client_secret = self.request.get("client_key")
        if session:
            credentials = OauthCredentials.query(OauthCredentials.client_id ==
                                                 session.client_id).get()
            if credentials:
                if credentials.secret == client_secret:
                    if not session.activated:
                        if (datetime.datetime.now() - session.created).total_seconds() <=\
                                CODE_EXPIRATION:
                            session.activated = True
                            session.put()
                            rdict["auth"] = {
                                "access_token": session.auth_token,
                                "group_id": session.group_id,
                                "account_id": session.account_id,
                            }
                            rdict["success"] = True
                        else:
                            rdict["msg"] = "Code expired"
                            self.response.status = 401
                    else:
                        rdict["msg"] = "Code has already been used"
                        self.response.status = 401
                else:
                    rdict["msg"] = "Could not validate credentials"
                    self.response.status = 401
            else:
                rdict["msg"] = "Could not load credentials"
                self.response.status = 500
        else:
            rdict["msg"] = "Invalid code"
            self.response.status = 401
        self.response.write(json.dumps(rdict))


ndb.toplevel(WSGIApplication([
    ("/oauth/new", StartOauthFlow),
    ("/oauth/code", ExchangeOauthCode),
], debug=True))
