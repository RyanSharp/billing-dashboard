function serializeObject(obj) {
    if (!obj || !obj.serializeConfig)
        throw "Seralize Config Required Parameter";
    var output = {};
    obj.serializeConfig.map(function(k) {output[k] = obj[k]});
    if (obj.structuredProperties)
        obj.structuredProperties.map(function(k) {output[k] = obj[k].map(function(prop) {return serializeObject(prop)})});
    if (obj.nestedProperties)
        obj.nestedProperties.map(function(k) {output[k] = serializeObject(obj[k])});
    if (obj._id)
        output[_id] = obj._id;
    return output;
}

module.exports = {
    serializeObject: serializeObject,
}