package crypto

import (
	"crypto/hmac"
	"crypto/sha1"
	"encoding/hex"
)

func Hmac(data string, secret string) string {
	h := hmac.New(sha1.New, []byte(secret))
	h.Write([]byte(data))
	return hex.EncodeToString(h.Sum(nil))
}
