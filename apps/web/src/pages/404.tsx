import { Button, displayFlex, styled } from '@affine/component';
import { useTranslation } from '@affine/i18n';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React from 'react';
import { Helmet } from 'react-helmet-async';

import ErrorImg from '../../public/imgs/invite-error.svg';

export const StyledContainer = styled.div(() => {
  return {
    ...displayFlex('center', 'center'),
    flexDirection: 'column',
    height: '100vh',

    img: {
      width: '360px',
      height: '270px',
    },
    p: {
      fontSize: '22px',
      fontWeight: 600,
      margin: '24px 0',
    },
  };
});

export const NotfoundPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <StyledContainer data-testid="notFound">
      <Image alt="404" src={ErrorImg}></Image>

      <p>{t('404 - Page Not Found')}</p>
      <Button
        shape="round"
        onClick={() => {
          router.push('/');
        }}
      >
        {t('Back Home')}
      </Button>
    </StyledContainer>
  );
};

export default function Custom404() {
  return (
    <>
      <Helmet>
        s<title>404 - AFFiNE</title>
      </Helmet>
      <NotfoundPage></NotfoundPage>
    </>
  );
}
