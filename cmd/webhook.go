package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"github.com/michaeljguarino/forge/crypto"
	"github.com/urfave/cli"
	"io/ioutil"
	"net/http"
)

type webhookRequest struct {
	Repository string `json:"repository"`
	Message    string `json:"message"`
}

func handleWebhook(c *cli.Context) error {
	repository := c.Args().Get(0)
	msg := c.Args().Get(1)
	secret := c.String("secret")
	url := c.String("url")
	marshalled, _ := json.Marshal(webhookRequest{
		Repository: repository,
		Message:    msg,
	})
	fmt.Println("Request body: ", string(marshalled))
	signature := crypto.Hmac(string(marshalled), secret)
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(marshalled))
	req.Header.Set("X-Watchman-Signature", fmt.Sprintf("sha1=%s", signature))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	fmt.Println("response Status:", resp.Status)
	fmt.Println("response Headers:", resp.Header)
	body, _ := ioutil.ReadAll(resp.Body)
	fmt.Println("response Body:", string(body))
	return nil
}
