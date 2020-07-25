package provider

import (
	"fmt"
	"os"
	"os/exec"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/michaeljguarino/forge/manifest"
	"github.com/michaeljguarino/forge/utils"
)

type AWSProvider struct {
	cluster       string
	project       string
	bucket        string
	region        string
	storageClient *s3.S3
}

const awsBackendTemplate = `terraform {
	backend "s3" {
		bucket = "%s"
		prefix = "%s"
		region = "%s"
	}
}
`

func mkAWS() (*AWSProvider, error) {
	cluster, _ := utils.ReadLine("Enter the name of your cluster: ")
	bucket, _ := utils.ReadLine("Enter the name of a s3 bucket to use for state, eg: <yourprojectname>-tf-state: ")
	region, _ := utils.ReadLine("Enter the region you want to deploy to eg us-east-1: ")

	client, err := getClient(region)
	if err != nil {
		return nil, err
	}

	provider := &AWSProvider{
		cluster,
		"",
		bucket,
		region,
		client,
	}
	projectManifest := manifest.ProjectManifest{
		Cluster:  cluster,
		Project:  "",
		Bucket:   bucket,
		Provider: AWS,
		Region:   provider.Region(),
	}
	path := manifest.ProjectManifestPath()
	projectManifest.Write(path)

	return provider, nil
}

func awsFromManifest(man *manifest.Manifest) (*AWSProvider, error) {
	client, err := getClient(man.Region)
	if err != nil {
		return nil, err
	}

	return &AWSProvider{man.Cluster, man.Project, man.Bucket, man.Region, client}, nil
}

func getClient(region string) (*s3.S3, error) {
	sess, err := session.NewSession(&aws.Config{
		Region: aws.String(region),
	})

	if err != nil {
		return nil, err
	}

	return s3.New(sess), nil
}

func (aws *AWSProvider) CreateBackend(prefix string) (string, error) {
	if err := aws.mkBucket(aws.bucket); err != nil {
		return "", err
	}
	return fmt.Sprintf(awsBackendTemplate, aws.bucket, prefix, aws.region), nil
}

func (aws *AWSProvider) KubeConfig() error {
	if utils.InKubernetes() {
		return nil
	}

	cmd := exec.Command(
		"aws", "eks", "update-kubeconfig", "--name", aws.cluster, "--region", aws.region)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	return cmd.Run()
}

func (p *AWSProvider) mkBucket(name string) error {
	client := p.storageClient
	_, err := client.HeadBucket(&s3.HeadBucketInput{Bucket: aws.String(name)})

	if err != nil {
		_, err = client.CreateBucket(&s3.CreateBucketInput{Bucket: aws.String(name)})
		return err
	}

	return nil
}

func (aws *AWSProvider) Name() string {
	return AWS
}

func (aws *AWSProvider) Cluster() string {
	return aws.cluster
}

func (aws *AWSProvider) Project() string {
	return aws.project
}

func (aws *AWSProvider) Bucket() string {
	return aws.bucket
}

func (aws *AWSProvider) Region() string {
	return aws.region
}
