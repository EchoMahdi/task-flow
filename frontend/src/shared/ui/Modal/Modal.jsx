/**
 * Shared Modal Component
 * 
 * A reusable modal/dialog component.
 * Used across all features for dialogs and modals.
 * 
 * @module shared/ui/Modal
 */

import { forwardRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

/**
 * Shared Modal component
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.open - Modal open state
 * @param {Function} props.onClose - Close handler
 * @param {string} props.title - Modal title
 * @param {React.ReactNode} props.children - Modal content
 * @param {React.ReactNode} props.actions - Modal actions (buttons)
 * @param {string} props.size - Modal size (xs, sm, md, lg, xl)
 * @param {boolean} props.fullWidth - Full width modal
 * @param {boolean} props.showCloseButton - Show close button in header
 * @param {Object} props.sx - MUI sx prop for custom styling
 */
const Modal = forwardRef(({
  open,
  onClose,
  title,
  children,
  actions,
  size = 'sm',
  fullWidth = true,
  showCloseButton = true,
  sx,
  ...rest
}, ref) => {
  return (
    <Dialog
      ref={ref}
      open={open}
      onClose={onClose}
      fullWidth={fullWidth}
      maxWidth={size}
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 2,
          ...sx,
        },
      }}
      {...rest}
    >
      {title && (
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pb: 1,
          }}
        >
          <Typography variant="h6" component="h2" fontWeight={600}>
            {title}
          </Typography>
          {showCloseButton && (
            <IconButton
              aria-label="close"
              onClick={onClose}
              size="small"
              sx={{
                color: 'text.secondary',
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </DialogTitle>
      )}
      
      <DialogContent>
        <Box sx={{ pt: title ? 0 : 2 }}>
          {children}
        </Box>
      </DialogContent>
      
      {actions && (
        <DialogActions sx={{ px: 3, pb: 2 }}>
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
});

Modal.displayName = 'Modal';

export { Modal };
export default Modal;
