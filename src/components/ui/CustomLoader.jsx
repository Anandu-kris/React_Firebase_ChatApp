import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

const Loader = styled(Box)(() => ({
  width: '75px',
  aspectRatio: '1',
  '--_c': 'no-repeat radial-gradient(farthest-side, #42A5F9 92%, transparent)',
  background: `
    var(--_c) top,
    var(--_c) left,
    var(--_c) right,
    var(--_c) bottom
  `,
  backgroundSize: '20px 20px',
  animation: 'l7 1s infinite',
  '@keyframes l7': {
    to: {
      transform: 'rotate(.5turn)',
    },
  },
}));

const LoaderContainer = styled(Box)(() => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '50vh',
}));

const CustomLoader = () => {
  return (
    <LoaderContainer>
      <Loader />
    </LoaderContainer>
  );
};

export default CustomLoader;
