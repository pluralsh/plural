#!python3
import boto3
import csv

def bucket_attributes(client, buckets):
    for _, b in enumerate(buckets):
        bucket = b['Name']
        enc = client.get_bucket_encryption(Bucket=bucket)
        rules = enc['ServerSideEncryptionConfiguration']['Rules'] or []
        if len(rules) > 0:
            yield (bucket, rules[0]['ApplyServerSideEncryptionByDefault']['SSEAlgorithm'])
        else:
            yield (bucket, 'None')

def run():
    client = boto3.client('s3')
    response = client.list_buckets()

    with open('buckets.csv', 'w') as f:
        writer = csv.writer(f)
        for entry in bucket_attributes(client, response['Buckets']):
            writer.writerow(entry)


if __name__ == '__main__':
    run()