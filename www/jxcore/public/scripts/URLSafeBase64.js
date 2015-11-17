// Takes a Base64 string and removes the URL unsafe characters
var URLSafeBase64 = {

  encode: function(string) {
    // Replace '/' with '_' and remove ending '='
    return string.replace(/\//g, '_').replace(/=+$/, '');
  },

  decode: function(base64) {
    // Append ending '='
    base64 += Array(5 - base64.length % 4).join('=');
    // Replace '_' with '/'
    return base64.replace(/\_/g, '/');
  }

};
