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