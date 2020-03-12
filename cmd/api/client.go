package api

import (
	"context"
	"fmt"

	"github.com/michaeljguarino/forge/config"
	"github.com/michaeljguarino/graphql"
)

const endpoint = "https://forge.piazza.app/gql"
const pageSize = 100

type Client struct {
	gqlClient *graphql.Client
	config    config.Config
}

func NewClient() *Client {
	conf := config.Read()
	return FromConfig(&conf)
}

func FromConfig(conf *config.Config) *Client {
	return &Client{graphql.NewClient(endpoint), *conf}
}

func NewUploadClient() *Client {
	client := graphql.NewClient(endpoint, graphql.UseMultipartForm())
	conf := config.Read()
	return &Client{client, conf}
}

func (client *Client) Build(doc string) *graphql.Request {
	req := graphql.NewRequest(doc)
	req.Header.Set("Authorization", "Bearer "+client.config.Token)
	return req
}

func (client *Client) Run(req *graphql.Request, resp interface{}) error {
	return client.gqlClient.Run(context.Background(), req, &resp)
}

func (client *Client) EnableLogging() {
	client.gqlClient.Log = func(l string) { fmt.Println(l) }
}
