<p align="center">
  <img src="www/public/logos/plural-full-logo-black.svg" width="30%" />
</p>


<h3 align="center">
  The fastest way to build great infrastructure and deploy your software
</h3>

<p align="center">
  Plural empowers you to build and maintain cloud-native and production-ready infrastructure on Kubernetes.
</p>

<h3 align="center">
  🚀🔨☁️
</h3>

<p align="center">
  <img src="www/public/deployment-services.png" width="60%" />
  <br/>
</p>

<p align="center">
  <a href="https://discord.gg/pluralsh" target="_blank">
    <img alt="Discord" src="https://img.shields.io/discord/880830238723047424?style=flat-square">
  </a>
  <a href="#contributing">
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square">
  </a>
  <img alt="GitHub language count" src="https://img.shields.io/github/languages/count/pluralsh/plural">
  <img alt="GitHub top language" src="https://img.shields.io/github/languages/top/pluralsh/plural">
  <img alt="GitHub code size in bytes" src="https://img.shields.io/github/languages/code-size/pluralsh/plural">
  <img alt="GitHub pull requests" src="https://img.shields.io/github/issues-pr/pluralsh/plural">
  <img alt="GitHub contributors" src="https://img.shields.io/github/contributors/pluralsh/plural">
  <img alt="GitHub commit activity" src="https://img.shields.io/github/commit-activity/m/pluralsh/plural">
</p>


## ✨ Features

Plural will deploy open-source applications and proprietary services on Kubernetes in your cloud using common standards like Helm and Terraform.

The Plural platform provides the following:

* Fleet-Scale GitOps Engine to deploy any helm/kustomize or yaml based service into your fleet, securely and seamlessly scalable.
* Full visibility of your fleet and all deployed services via our secure Auth Proxy.
* Kubernetes CRD-native Infrastructure As Code Management, supporting Terraform, Ansible and Pulumi, to allow you to scale usage of best practices tools without labor intensive CI/CD and branching strategies.  Get the scaling promise of Crossplane with the configuration language of terraform.
* Automated Pull Request Generation to provide full ui-based self-service while still maintaining the rigor and auditability of GitOps
* 360 Degree AI Integration, leveraging the fully integrated, all-in-one Plural platform to generate uniquely accurate AI insights into the state of your fleet and how to fix inevitable misconfigurations that might have arisen. 

In addition, the Plural api also provides:
* A DNS service to register fully-qualified domains under onplural.sh to eliminate the hassle of DNS registration for users.
* Being an OIDC provider to enable zero touch login security for all deployed Plural Console applications or any other application managed by it.

We think it's pretty cool! 😎 Some other nice things:

## ✨ 360-degree AI Powered Insights

Use Plural's accumulated knowledge of the state of your infrastructure from metadata gathered from GitOps deployments, IaC management and the Kubernetes API's rich REST API to give AI insights that actually work.  We'll know what's going on, and let AI explain it back to you in accessible natural language, in an automated way so your devops engineers don't have to.  This includes:

* provide natural language explanations why any service or terraform stack is currently failing
* provide suggested code changes using context from the GitOps manifests associated with any failing service
* explain any kubernetes or terraform UI page to blunt the sharp edges of the Platform Engineering learning curve

### 🔓 Secure by default
Plural is fully self-hosted within your own environment, meaning we don't touch your credentials or sensitive information. 

Cluster setup includes deploying our Plural deployment operator, which efficiently polls the control plane for any changes that need to be applied. This ensures that our control plane doesn’t reach into these workload clusters, providing a more secure setup than push-based models and removing the need for credentials to be centralized in a single major attack-vector.

All Plural deployments are also fully customizable with our centralized secrets management. Additionally, we natively support deploying to brand new clusters or adopting existing K8s clusters.
<br/><br/>


## 📽 Check out a video Demo

<br /><br />

[![Fleet Management with Plural](https://img.youtube.com/vi/W8KCaiZRV3M/0.jpg)](https://www.youtube.com/watch?v=W8KCaiZRV3M&ab_channel=Plural)



## 🏁 Getting Started

1. Go to https://app.plural.sh to create an account.<br />
*Note: This is simply to track your open-source installations and deploy your Console.*
2. [Install the Plural CLI](https://docs.plural.sh/getting-started/getting-started#install-plural-cli)
3. [Deploy your Plural Console](https://docs.plural.sh/how-to/set-up/mgmt-cluster).

Once you have your Plural Console running, feel free to walk through our how-to guide to see more of the core functionality of Plural: https://docs.plural.sh/how-to


## 📚 Documentation

Full documentation is available on our [Documentation site](https://docs.plural.sh/).  It covers both our mainline Fleet Management platform, and our legacy open source marketplace (soon to be merged into the mainline product).  Feel free to browse either, but we'd recommend any new users start with Plural's fleet management suite of solutions.

<br /><br />



## 💬 Community

For general help, please refer to the Plural documentation. For additional help you can use the following channels:

* [Discord](https://discord.gg/pluralsh) (For live discussions with the Plural team).
* [GitHub](https://github.com/pluralsh/plural/) (Bug reports, feature requests, contributions).
* [Twitter](https://twitter.com/plural_sh) (For our latest news).

Plural is dedicated to providing a welcoming, diverse, and harassment-free experience for everyone. We expect everyone in the community to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). *Please read it.*
<br /><br />


## 🚗 Roadmap
See what we're working on in these GitHub projects. Help us prioritize issues by reacting with an emoji on the issue!
* Application Onboarding Roadmap: https://github.com/orgs/pluralsh/projects/2/views/2
* Plural Core Issues: https://github.com/pluralsh/plural/issues
* Plural CLI Issues: https://github.com/pluralsh/plural-cli/issues
<br /><br />



## 🙌 Contributing to Plural

We love contributions to Plural, big or small! To learn more about the repo and the architecture, see our [Contribution Guide](CONTRIBUTING.md). <br />

If you're not sure where to start, or if you have any questions, please open a draft PR or visit our [Discord](https://discord.gg/pluralsh) server where the core team can help answer your questions.
<br /><br />



## 📝 License

See [LICENSE](LICENSE) for licensing information. If there are any questions on the license please visit our [Discord](https://discord.gg/pluralsh).

## Thanks to all the contributors ❤
 <a href = "https://github.com/pluralsh/plural/graphs/contributors">
   <img src = "https://contrib.rocks/image?repo=pluralsh/plural"/>
 </a>
