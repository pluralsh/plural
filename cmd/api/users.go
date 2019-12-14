package api

const loginQuery = `
	mutation Login($email: String!, $pwd: String!) {
		login(email: $email, password: $pwd) {
			jwt
		}
	}
`

const createTokenQuery = `
	mutation {
		createToken {
			token
		}
	}
`

const listTokenQuery = `
	query {
		tokens(first: 3) {
			edges {
				node {
					token
				}
			}
		}
	}
`

const createWebhookMut = `
	mutation CreateWebhook($url: String!) {
		createWebhook(attributes: {url: $url}) {
			url
			secret
		}
	}
`

type login struct {
	Login struct {
		Jwt string `json:"jwt"`
	}
}

type createToken struct {
	CreateToken struct {
		Token string
	}
}

type listToken struct {
	Tokens struct {
		Edges []struct {
			Node struct {
				Token string
			}
		}
	}
}

type createWebhook struct {
	CreateWebhook Webhook
}

func (client *Client) Login(email, pwd string) (string, error) {
	var resp login
	req := client.Build(loginQuery)
	req.Var("email", email)
	req.Var("pwd", pwd)
	err := client.Run(req, &resp)
	return resp.Login.Jwt, err
}


func (client *Client) CreateAccessToken() (string, error) {
	var resp createToken
	req := client.Build(createTokenQuery)
	err := client.Run(req, &resp)
	return resp.CreateToken.Token, err
}

func (client *Client) GrabAccessToken() (string, error) {
	var resp listToken
	req := client.Build(listTokenQuery)
	err := client.Run(req, &resp)
	if err != nil {
		return "", err
	}
	if len(resp.Tokens.Edges) > 0 {
		return resp.Tokens.Edges[0].Node.Token, nil
	}

	return client.CreateAccessToken()
}

func (client *Client) CreateWebhook(url string) (Webhook, error) {
	var resp createWebhook
	req := client.Build(createWebhookMut)
	req.Var("url", url)
	err := client.Run(req, &resp)
	if err != nil {
		return resp.CreateWebhook, err
	}

	return resp.CreateWebhook, nil
}