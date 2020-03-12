# Watchman

Webhook receiver deployment to handle auto-upgrades on chart version push.  The deployment basically just wraps the forge cli and handles git for you as well.

The service requires strong credentials to operate, so it's recommended that you utilize the secured workspace
given by forge.