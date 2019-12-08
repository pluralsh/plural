package utils

import (
	"golang.org/x/crypto/bcrypt"
	"encoding/base64"
	"crypto/rand"
	"io"
)

func HashPwd(pwd string) string {
	hash, _ := bcrypt.GenerateFromPassword([]byte(pwd), bcrypt.MinCost)
	return string(hash)
}

func VerifyPwd(hash, pwd string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(pwd))
	if err != nil {
		return false
	}

	return true
}


func GenAESKey() string {
	key := make([]byte, 32)
	if _, err := io.ReadFull(rand.Reader, key); err != nil {
		panic(err)
	}

	return base64.URLEncoding.EncodeToString(key)
}
