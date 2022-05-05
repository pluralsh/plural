import React, { useEffect } from 'react'
import { useMutation, useQuery } from 'react-apollo'
import { CREATE_DEMO_PROJECT, POLL_DEMO_PROJECT } from '../query'
import { LoopingLogo } from '../../utils/AnimatedLogo'
import { Box, Text } from 'grommet'


function PollProject({ demo, setDemo, setProvider, workspace, setWorkspace, credentials, setCredentials, next }) {
    const {data} = useQuery(POLL_DEMO_PROJECT, {variables: {id: demo.id}, pollInterval: 10000})

    useEffect(() => {
        if (!data) return
        const polled = data.demoProject
        if (polled.ready) {
            setDemo(polled)
            setProvider('GCP')
            setWorkspace({...workspace, region: 'us-east1', project: polled.projectId})
            setCredentials({...credentials, gcp: {applicationCredentials: polled.credentials}})
            next()
        }
    }, [data])

    return (
        <Box fill>
            <Text size='small'>Creating your demo project, this might take a minute...</Text>
            <LoopingLogo />
        </Box>
    )
}

export function DemoProject({ setProvider, workspace, setWorkspace, credentials, setCredentials, next, setDemo } ) {
    const [mutation, {data}] = useMutation(CREATE_DEMO_PROJECT)

    useEffect(() => {
        mutation()
    }, [])

    if (data) {
        return (
            <PollProject 
                demo={data.createDemoProject}
                setDemo={setDemo}
                setProvider={setProvider}
                workspace={workspace}
                setWorkspace={setWorkspace}
                credentials={credentials}
                setCredentials={setCredentials}
                next={next} />
        )
    } 

    return (
        <Box fill>
            <LoopingLogo />
        </Box>
    )
}