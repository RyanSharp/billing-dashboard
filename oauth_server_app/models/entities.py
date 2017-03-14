from google.appengine.ext import ndb


class OauthCredentials(ndb.Model):
    client_id = ndb.StringProperty()
    secret = ndb.StringProperty()
    redirect_uri = ndb.StringProperty()
    middleware_token = ndb.StringProperty()
    created = ndb.DateTimeProperty(auto_now_add=True)
    modified = ndb.DateTimeProperty(auto_now=True)


class OauthSession(ndb.Model):
    '''
        Store the session information for an Access Token and Code
    '''
    client_id = ndb.StringProperty()
    auth_token = ndb.StringProperty()
    ip_address = ndb.StringProperty()
    user_agent = ndb.StringProperty()
    account_id = ndb.IntegerProperty()
    group_id = ndb.IntegerProperty()
    code = ndb.StringProperty()
    activated = ndb.BooleanProperty()
    created = ndb.DateTimeProperty(auto_now_add=True)
    modified = ndb.DateTimeProperty(auto_now=True)
