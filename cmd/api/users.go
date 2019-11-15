package api

const loginQuery = `
	mutation Login($email: String!, $pwd: String!) {
		login(email: $email, password: $pwd) {
			jwt
		}
	}
`

type login struct {
	Login struct {
		Jwt string `json:"jwt"`
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