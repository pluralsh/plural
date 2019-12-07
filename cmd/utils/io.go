package utils

import (
	"bufio"
	"github.com/fatih/color"
	"golang.org/x/crypto/ssh/terminal"
	"os"
	"syscall"
	"strings"
)

func ReadLine(prompt string) (string, error) {
	reader := bufio.NewReader(os.Stdin)
	color.New(color.Bold).Printf(prompt)
	email, err := reader.ReadString('\n')
	return strings.TrimSpace(string(email)), err
}

func ReadPwd(prompt string) (string, error) {
	color.New(color.Bold).Printf(prompt)
	pwd, err := terminal.ReadPassword(int(syscall.Stdin))
	return strings.TrimSpace(string(pwd)), err
}

func Warn(line string, args... interface{}) {
	color.New(color.FgYellow, color.Bold).Printf(line, args...)
}

func Success(line string, args... interface{}) {
	color.New(color.FgGreen, color.Bold).Printf(line, args...)
}

func Highlight(line string, args... interface{}) {
	color.New(color.Bold).Printf(line, args...)
}