package provider

import (
	"cloud.google.com/go/storage"
	"context"
	"fmt"
	"github.com/michaeljguarino/chartmart/manifest"
	"github.com/michaeljguarino/chartmart/utils"
	"google.golang.org/api/option"
	"os"
	"os/exec"
)

type GCPProvider struct {
	cluster       string
	project       string
	bucket        string
	storageClient *storage.Client
	ctx           context.Context
}

const backendTemplate = `terraform {
	backend "gcs" {
		bucket = "%s"
		prefix = "%s"
	}
}
`

func mkGCP() (*GCPProvider, error) {
	client, ctx, err := storageClient()
	if err != nil {
		return nil, err
	}
	cluster, _ := utils.ReadLine("Enter the name of your cluster: ")
	project, _ := utils.ReadLine("Enter the name of its gcp project: ")
	bucket, _ := utils.ReadLine("Enter the name of a gcs bucket to use for state, eg: <yourprojectname>-tf-state: ")
	provider := &GCPProvider{
		cluster,
		project,
		bucket,
		client,
		ctx,
	}
	projectManifest := manifest.ProjectManifest{
		Cluster: cluster,
		Project: project,
		Bucket: bucket,
		Provider: GCP,
	}
	path := manifest.ProjectManifestPath()
	projectManifest.Write(path)

	return provider, nil
}

func storageClient() (*storage.Client, context.Context, error) {
	ctx := context.Background()
	opt := option.WithCredentialsFile(os.Getenv("GOOGLE_CREDENTIALS"))
	client, err := storage.NewClient(ctx, opt)
	return client, ctx, err
}

func gcpFromManifest(man *manifest.Manifest) (*GCPProvider, error) {
	client, ctx, err := storageClient()
	if err != nil {
		return nil, err
	}

	return &GCPProvider{man.Cluster, man.Project, man.Bucket, client, ctx}, nil
}

func (gcp *GCPProvider) KubeConfig() error {
	// move tf supported env var to gcloud's
	os.Setenv("GOOGLE_APPLICATION_CREDENTIALS", os.Getenv("GOOGLE_CREDENTIALS"))
	cmd := exec.Command("gcloud", "container", "clusters", "get-credentials", gcp.cluster)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	return cmd.Run()
}

func (gcp *GCPProvider) CreateBackend(prefix string) (string, error) {
	if err := gcp.mkBucket(gcp.bucket); err != nil {
		return "", err
	}
	return fmt.Sprintf(backendTemplate, gcp.bucket, prefix), nil
}

func (gcp *GCPProvider) mkBucket(name string) error {
	bkt := gcp.storageClient.Bucket(name)
	if _, err := bkt.Attrs(gcp.ctx); err != nil {
		return bkt.Create(gcp.ctx, gcp.project, nil)
	}
	return nil
}

func (gcp *GCPProvider) Name() string {
	return GCP
}

func (gcp *GCPProvider) Cluster() string {
	return gcp.cluster
}

func (gcp *GCPProvider) Project() string {
	return gcp.project
}

func (gcp *GCPProvider) Bucket() string {
	return gcp.bucket
}
