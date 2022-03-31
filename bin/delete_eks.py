import boto3
import click
import time

def waiter(fun, sleep=2):
  while True:
    try:
      click.echo(fun())
      time.sleep(sleep)
    except:
      click.echo("finished!!")
      return

def delete_nodegroup(client, cluster, group):
  client.delete_nodegroup(clusterName=cluster, nodegroupName=group)
  def get_ng():
    resp = client.describe_nodegroup(clusterName=cluster, nodegroupName=group)
    status = resp['nodegroup']['status']
    return f'{group} status: {status}'
  waiter(get_ng)

def delete_cluster(client, cluster):
  client.delete_cluster(name=cluster)
  def get_cluster():
    resp = client.describe_cluster(name=cluster)
    status = resp['cluster']['status']
    return f'{cluster} status: {status}'
  waiter(get_cluster)

@click.group()
def cli():
    pass

@cli.command()
@click.argument('name')
def delete(name):
  client = boto3.client('eks')
  nodes_resp = client.list_nodegroups(clusterName=name, maxResults=100)
  for group in nodes_resp['nodegroups']:
    delete_nodegroup(client, name, group)
  
  delete_cluster(client, name)

@cli.command()
def list():
  client = boto3.client('eks')
  resp = client.list_clusters(maxResults=100)
  for cluster in resp['clusters']:
    click.echo(cluster)

if __name__ == '__main__':
  cli()