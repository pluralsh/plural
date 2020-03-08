package utils

import (
	"crypto/sha256"
	"encoding/hex"
	"golang.org/x/crypto/bcrypt"
	"encoding/base64"
	"crypto/rand"
	"io"
	"os"
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

func Sha256(path string) (string, error) {
	hasher := sha256.New()
	f, err := os.Open(path)
	if err != nil {
		return "nil", err
	}
	defer f.Close()
	if _, err := io.Copy(hasher, f); err != nil {
			return "nil", err
	}

	return hex.EncodeToString(hasher.Sum(nil)), nil
}