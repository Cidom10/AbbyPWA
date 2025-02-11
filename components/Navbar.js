import { Container, Text, Button, Card, Title, Progress, Divider, Box, Flex, Anchor } from '@mantine/core';
import { IconCalendar, IconCamera, IconHome, IconMovie, IconNote } from '@tabler/icons-react';
import theme from "../theme"

function Navbar() {

    return <Flex direction={"row"} w={"100vw"} h={"7vh"} justify={"center"} align={"center"} p={0}
        style={{ borderTop: `1px solid ${theme.colors.brand[5]}`, position: "absolute", bottom: 0, borderRadius: "20px" }}
    >
        <Flex direction={"column"} justify={"center"} align={"center"} w={"20%"} h={"100%"}
            style={{ borderRight: `1px solid ${theme.colors.brand[5]}` }}
            onClick={() => window.location.href = "/notes"}
        >
            <IconNote color={theme.colors.brand[5]} />
            <Text>Notes</Text>
        </Flex>
        <Flex direction={"column"} justify={"center"} align={"center"} w={"20%"} h={"100%"}
            style={{ borderRight: `1px solid ${theme.colors.brand[5]}` }}
            onClick={() => window.location.href = "/movies"}
        >
            <IconMovie color={theme.colors.brand[5]} />
            <Text>Movies</Text>
        </Flex>
        <Flex direction={"column"} justify={"center"} align={"center"} w={"20%"} h={"100%"}
            style={{ borderRight: `1px solid ${theme.colors.brand[5]}` }}
            onClick={() => window.location.href = "/"}
        >
            <IconHome color={theme.colors.brand[5]} />
            <Text>Home</Text>
        </Flex>
        <Flex direction={"column"} justify={"center"} align={"center"} w={"20%"} h={"100%"}
            style={{ borderRight: `1px solid ${theme.colors.brand[5]}` }}
            onClick={() => window.location.href = "/pictures"}
        >
            <IconCamera color={theme.colors.brand[5]} />
            <Text>Pictures</Text>
        </Flex>
        <Flex direction={"column"} justify={"center"} align={"center"} w={"20%"} h={"100%"}
            onClick={() => window.location.href = "/dates"}
        >
            <IconCalendar color={theme.colors.brand[5]} />
            <Text>Dates</Text>
        </Flex>
    </Flex>
}

export default Navbar;