// function InstalledRepositoryActions({ installation, ...props }: any) {
//   const [open, setOpen] = useState(false)

//   return (
//     <>
//       <Flex
//         align="center"
//         gap="medium"
//         {...props}
//       >
//         <InferredConsoleButton
//           secondary
//           text="Console"
//           flexGrow={1}
//         />
//         <Button
//           secondary
//           onClick={() => setOpen(true)}
//         >
//           <GearTrainIcon
//             position="relative"
//             height="24px"
//           />
//         </Button>
//       </Flex>
//       <InstallationConfiguration
//         open={open}
//         setOpen={setOpen}
//         installation={installation}
//       />
//     </>
//   )
// }
