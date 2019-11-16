package provider

import (
	"bufio"
	"fmt"
	"github.com/fatih/color"
	"github.com/michaeljguarino/chartmart/manifest"
	"os"
	"strconv"
	"strings"
)

type Provider interface {
	Name() string
	Cluster() string
	Project() string
	Bucket() string
	KubeConfig() error
	CreateBackend(prefix string) (string, error)
}

func Select() (Provider, error) {
	available := []string{GCP}
	fmt.Println("Select on of the following providers:")
	for i, name := range available {
		fmt.Printf("[%d] %s\n", i, name)
	}
	fmt.Println("")

	reader := bufio.NewReader(os.Stdin)
	color.New(color.Bold).Print("Your choice: ")
	val, _ := reader.ReadString('\n')
	i, err := strconv.Atoi(strings.TrimSpace(val))
	if err != nil {
		return nil, err
	}
	if i >= len(available) {
		return nil, fmt.Errorf("Invalid index, must be < %d", len(available))
	}
	color.New(color.FgGreen, color.Bold).Printf("Using provider %s\n", available[i])
	return New(available[i])
}

func FromManifest(man *manifest.Manifest) (Provider, error) {
	switch man.Provider {
	case GCP:
		return gcpFromManifest(man)
	default:
		return nil, fmt.Errorf("Invalid provider name: %s", man.Provider)
	}
}

func New(provider string) (Provider, error) {
	switch provider {
	case GCP:
		return mkGCP()
	default:
		return nil, fmt.Errorf("Invalid provider name: %s", provider)
	}
}
