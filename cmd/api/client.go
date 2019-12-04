package api

import (
	"context"
	"github.com/machinebox/graphql"
	"github.com/michaeljguarino/chartmart/config"
)

const endpoint = "https://mart.piazzaapp.com/gql"
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
