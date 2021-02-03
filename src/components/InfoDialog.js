import React from "react";
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import InfoIcon from '@material-ui/icons/Info';
import Dialog from '@material-ui/core/Dialog';
import List from '@material-ui/core/List';
import Link from '@material-ui/core/Link';
import ListItem from '@material-ui/core/ListItem';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Slide from '@material-ui/core/Slide';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function AlertDialogSlide() {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
          <IconButton variant="outlined" color="primary" onClick={handleClickOpen}>
        <InfoIcon />
          </IconButton>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-labelledby="alert-dialog-slide-title"
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle id="alert-dialog-slide-title">{"What is this?"}</DialogTitle>
        <DialogContent>
            <List>
                <ListItem>              
                    This is a geographic representation of Covid-19 data.  I do not own this data, and it is publicly available from: <Link href="https://www.ecdc.europa.eu/en/covid-19/data" target="ecdc">ECDC</Link>.
                </ListItem>
                <ListItem>
                    You can use the control buttons, left/right arrow keys and swipe to navigate the data.
                </ListItem>
                <ListItem>
                    Weekly representations are adjusted for the maximum value of the metric of that week.
                </ListItem>
                <ListItem>
                    Mortality is not a true mortality representation as it is the number of deaths over new cases for that week.  However, deaths have a latency and therefore do not represent a relationship to the new case.
                </ListItem>
            </List>
          </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}