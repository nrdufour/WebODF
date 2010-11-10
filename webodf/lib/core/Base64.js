/*jslint bitwise: false*/
/*global window core*/
/*
 * $Id: base64.js,v 0.9 2009/03/01 20:51:18 dankogai Exp dankogai $
 */
/**
 * @namespace
 */
core.Base64 = (function () {
    var b64chars
        = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
    
        b64charcodes = (function () {
            var a = [], i,
                codeA = 'A'.charCodeAt(0),
                codea = 'a'.charCodeAt(0),
                code0 = '0'.charCodeAt(0);
            for (i = 0; i < 26; i += 1) {
                a.push(codeA + i);
            }
            for (i = 0; i < 26; i += 1) {
                a.push(codea + i);
            }
            for (i = 0; i < 10; i += 1) {
                a.push(code0 + i);
            }
            a.push('+'.charCodeAt(0));
            a.push('/'.charCodeAt(0));
            return a;
        }()),
    
        b64tab = (function (bin) {
            var t = {}, i, l;
            for (i = 0, l = bin.length; i < l; i += 1) {
                t[bin.charAt(i)] = i;
            }
            return t;
        }(b64chars)),
        convertUTF16StringToBase64,
        convertBase64ToUTF16String,
        btoa, atob;

    /**
     * @param {!string} s
     * @return {!Array}
     */
    function stringToArray(s) {
        var a = [], i, l = s.length;
        for (i = 0; i < l; i += 1) {
            a[i] = s.charCodeAt(i) & 0xff;
        }
        return a;
    }
    
    function convertUTF8ArrayToBase64(bin) {
        var padlen = 0,
            b64 = [],
            i, l = bin.length,
            c0, c1, c2, n;
        while (bin.length % 3) {
            bin.push(0);
            padlen += 1;
        }
        for (i = 0; i < l; i += 3) {
            c0 = bin[i];
            c1 = bin[i + 1];
            c2 = bin[i + 2];
            if (c0 >= 256 || c1 >= 256 || c2 >= 256) {
                throw 'unsupported character found ' + c0 + ' ' + c1 + ' ' + c2;
            }
            n = (c0 << 16) | (c1 << 8) | c2;
            b64.push(
                b64charcodes[n >>> 18],
                b64charcodes[(n >>> 12) & 63],
                b64charcodes[(n >>>  6) & 63],
                b64charcodes[n          & 63]
            );
        }
        for (padlen -= 1; padlen >= 0; padlen -= 1) {
            b64[b64.length - padlen - 1] = '='.charCodeAt(0);
        }
        return String.fromCharCode.apply(String, b64);
    }
    
    function convertBase64ToUTF8Array(b64) {
        b64 = b64.replace(/[^A-Za-z0-9+\/]+/g, '');
        var bin = [],
            padlen = b64.length % 4,
            i, l = b64.length, n;
        for (i = 0; i < l; i += 4) {
            n = ((b64tab[b64.charAt(i)]     || 0) << 18) |
                ((b64tab[b64.charAt(i + 1)] || 0) << 12) |
                ((b64tab[b64.charAt(i + 2)] || 0) <<  6) |
                ((b64tab[b64.charAt(i + 3)] || 0));
            bin.push(
                (n >> 16),
                ((n >>  8) & 0xff),
                (n         & 0xff)
            );
        }
        bin.length -= [0, 0, 2, 1][padlen];
        return bin;
    }
    
    function convertUTF16ArrayToUTF8Array(uni) {
        var bin = [], i, l = uni.length, n;
        for (i = 0; i < l; i += 1) {
            n = uni[i];
            if (n < 0x80) {
                bin.push(n);
            } else if (n < 0x800) {
                bin.push(
                    0xc0 | (n >>>  6),
                    0x80 | (n & 0x3f));
            } else {
                bin.push(
                    0xe0 | ((n >>> 12) & 0x0f),
                    0x80 | ((n >>>  6) & 0x3f),
                    0x80 |  (n         & 0x3f));
            }
        }
        return bin;
    }
    
    function convertUTF8ArrayToUTF16Array(bin) {
        var uni = [], i, l = bin.length,
            c0, c1, c2;
        for (i = 0; i < l; i += 1) {
            c0 = bin[i];
            if (c0 < 0x80) {
                uni.push(c0);
            } else {
                i += 1;
                c1 = bin[i];
                if (c0 < 0xe0) {
                    uni.push(((c0 & 0x1f) << 6) | (c1 & 0x3f));
                } else {
                    i += 1;
                    c2 = bin[i];
                    uni.push(((c0 & 0x0f) << 12) | ((c1 & 0x3f) << 6) |
                            (c2 & 0x3f)
                    );
                }
            }
        }
        return uni;
    }
    
    function convertUTF8StringToBase64(bin) {
        return convertUTF8ArrayToBase64(stringToArray(bin));
    }
    
    function convertBase64ToUTF8String(b64) {
        return String.fromCharCode.apply(String, convertBase64ToUTF8Array(b64));
    }
    
    function convertUTF8StringToUTF16Array(bin) {
        return convertUTF8ArrayToUTF16Array(stringToArray(bin));
    }
    
    function convertUTF8ArrayToUTF16String(bin) {
        return String.fromCharCode.apply(String, convertUTF8ArrayToUTF16Array(bin));
    }
    
    function convertUTF8StringToUTF16String(bin) {
        return String.fromCharCode.apply(String, convertUTF8ArrayToUTF16Array(stringToArray(bin)));
    }
    
    function convertUTF16StringToUTF8Array(uni) {
        return convertUTF16ArrayToUTF8Array(stringToArray(uni));
    }
    
    function convertUTF16ArrayToUTF8String(uni) {
        return String.fromCharCode.apply(String, convertUTF16ArrayToUTF8Array(uni));
    }
    
    function convertUTF16StringToUTF8String(uni) {
        return String.fromCharCode.apply(String, convertUTF16ArrayToUTF8Array(stringToArray(uni)));
    }
    
    if ((typeof window !== "undefined") && window.btoa) {
        btoa = window.btoa;
        convertUTF16StringToBase64 = function (uni) {
            return btoa(convertUTF16StringToUTF8String(uni));
        };
    } else {
        btoa = convertUTF8StringToBase64;
        convertUTF16StringToBase64 = function (uni) {
            return convertUTF8ArrayToBase64(convertUTF16StringToUTF8Array(uni));
        };
    }
    if ((typeof window !== "undefined") && window.atob) {
        atob = window.atob;
        convertBase64ToUTF16String = function (b64) {
            return convertUTF8StringToUTF16String(atob(b64));
        };
    } else {
        atob = convertBase64ToUTF8String;
        convertBase64ToUTF16String = function (b64) {
            return convertUTF8ArrayToUTF16String(convertBase64ToUTF8Array(b64));
        };
    }

    /**
     * @constructor
     */ 
    function Base64() {
        this.convertUTF8ArrayToBase64 = convertUTF8ArrayToBase64;
        this.convertByteArrayToBase64 = convertUTF8ArrayToBase64;
        this.convertBase64ToUTF8Array = convertBase64ToUTF8Array;
        this.convertBase64ToByteArray = convertBase64ToUTF8Array;
        this.convertUTF16ArrayToUTF8Array = convertUTF16ArrayToUTF8Array;
        this.convertUTF16ArrayToByteArray = convertUTF16ArrayToUTF8Array;
        this.convertUTF8ArrayToUTF16Array = convertUTF8ArrayToUTF16Array;
        this.convertByteArrayToUTF16Array = convertUTF8ArrayToUTF16Array;
        this.convertUTF8StringToBase64 = convertUTF8StringToBase64;
        this.convertBase64ToUTF8String = convertBase64ToUTF8String;
        this.convertUTF8StringToUTF16Array = convertUTF8StringToUTF16Array;
        this.convertUTF8ArrayToUTF16String = convertUTF8ArrayToUTF16String;
        this.convertByteArrayToUTF16String = convertUTF8ArrayToUTF16String;
        this.convertUTF8StringToUTF16String = convertUTF8StringToUTF16String;
        this.convertUTF16StringToUTF8Array = convertUTF16StringToUTF8Array;
        this.convertUTF16StringToByteArray = convertUTF16StringToUTF8Array;
        this.convertUTF16ArrayToUTF8String = convertUTF16ArrayToUTF8String;
        this.convertUTF16StringToUTF8String = convertUTF16StringToUTF8String;
        this.convertUTF16StringToBase64 = convertUTF16StringToBase64;
        this.convertBase64ToUTF16String = convertBase64ToUTF16String;
        this.fromBase64 = convertBase64ToUTF8String;
        this.toBase64 = convertUTF8StringToBase64;
        this.atob = atob;
        this.btoa = btoa;
        this.utob = convertUTF16StringToUTF8String;
        this.btou = convertUTF8StringToUTF16String;
        this.encode = convertUTF16StringToBase64;
        this.encodeURI = function (u) {
            return convertUTF16StringToBase64(u).replace(/[+\/]/g,
                    function (m0) {
                return m0 === '+' ? '-' : '_';
            }).replace(/=+$/, '');
        };
        this.decode =function(a){
            return convertBase64ToUTF16String(a.replace(/[-_]/g, function(m0){
                return m0 == '-' ? '+' : '/';
            }));
        };
    };
    return Base64;
})();