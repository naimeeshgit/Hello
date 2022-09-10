// material-ui
import { useTheme } from '@mui/material/styles';

 import logo from 'assets/images/logo_name.png';
// ==============================|| LOGO SVG ||============================== //

const Logo = () => {
    const theme = useTheme();

    return (
        
        // if you want to use image instead of svg uncomment following, and comment out <svg> element.
        
        <img src={logo} alt="Smartterra" width="70" />
         
    );
};

export default Logo;
