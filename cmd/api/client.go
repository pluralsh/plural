package api

import (
	"github.com/michaeljguarino/chartmart/config"
	"github.com/machinebox/graphql"
	"context"
)

const endpoint = "https://mart.piazzaapp.com/gql"
const pageSize = 100

type Client struct {
	gqlClient *graphql.Client
	config config.Config
}

func NewClient() *Client {
	conf := config.Read()
	return &Client{graphql.NewClient(endpoint), conf}
}

func (client *Client) Run(req *graphql.Request, resp interface{}) error {
	req.Header.Set("Authorization", "Bearer " + client.config.Token)
	return client.gqlClient.Run(context.Background(), req, &resp)
}