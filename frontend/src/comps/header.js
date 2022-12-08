import React from "react";
import nfter from '../Images/NFTer.png';

import {
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Spacer,
  Flex,
  Button,
  useColorMode,
  Divider,
  Switch,
} from "@chakra-ui/react";
import { SunIcon, MoonIcon } from '@chakra-ui/icons';


const Header = () => {

    const { colorMode, toggleColorMode } = useColorMode();
}

return (
    <Tabs>
        <img src ={nfter} alt ="NFTer"/>
        <Spacer />
        {colorMode === ('light') ? <SunIcon mt={3} mr={4}/> : <MoonIcon mt={3} mr={4}/>}
        <Switch onChange={toggleColorMode} colorScheme='blue' size='lg' mt={1.5} mr={4}/>
        <Button mr={4}>
          Login
        </Button>
    </Tabs>
);