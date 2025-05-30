import { Button, Checkbox, Col, Divider, Form, Input, Row } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AiFillGithub, AiFillGoogleCircle, AiFillWechat } from 'react-icons/ai';

import { SignInReq } from '@/api/services/userService';
import { useSignIn } from '@/store/userStore';

import { LoginButtonTeams } from './components/LoginButtonTeams';
import { LoginStateEnum, useLoginStateContext } from './providers/LoginStateProvider';

function LoginForm() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const { loginState, setLoginState } = useLoginStateContext();
  const signIn = useSignIn();

  if (loginState !== LoginStateEnum.LOGIN) return null;

  const handleFinish = async ({ username, password }: SignInReq) => {
    setLoading(true);
    try {
      await signIn({ username, password });
    } finally {
      setLoading(false);
    }
  };

  // handleFinish({ username: DEFAULT_USER.username, password: DEFAULT_USER.password });

  // return (
  //   <>
  //     {/* <div className="mb-4 text-2xl font-bold xl:text-3xl">{t('sys.login.signInFormTitle')}</div> */}
  //     <div className="mb-4 w-full text-center">
  //       {/* <ThreeDLoader
  //           colorRing1="#347928"
  //           colorRing2="#FCCD2A"
  //           desktopSize="100px"
  //           className="w-full"
  //           mobileSize="64px"
  //         /> */}
  //       {/* <ScatterBoxLoader
  //           primaryColor="#6366F1"
  //           background="#FFFFFF"
  //           desktopSize="50px"
  //           className="w-full"
  //           mobileSize="64px"
  //           size="32px"
  //         /> */}
  //       <Lottie animationData={dataJson} loop />

  //       <span className="break-words text-2xl font-thin">{textAutoLogin}</span>
  //     </div>
  //   </>
  // );

  return (
    <>
      <div className="mb-4 text-2xl font-bold xl:text-3xl">{t('sys.login.signInFormTitle')}</div>
      <Form
        name="login"
        size="large"
        initialValues={{
          remember: true,
          username: '',
          password: '',
        }}
        onFinish={handleFinish}
      >
        {/* <div className="mb-4 flex flex-col">
          <Alert
            type="info"
            description={
              <div className="flex flex-col">
                <div className="flex">
                  <ProTag className="flex-shrink-0">Admin {t('sys.login.userName')}:</ProTag>
                  <strong className="ml-1" style={{ color: themeToken.colorInfoTextHover }}>
                    <span>{DEFAULT_USER.username}</span>
                  </strong>
                </div>

                <div className="flex">
                  <ProTag className="flex-shrink-0">Test {t('sys.login.userName')}:</ProTag>
                  <strong className="ml-1" style={{ color: themeToken.colorInfoTextHover }}>
                    <span>{TEST_USER.username}</span>
                  </strong>
                </div>

                <div>
                  <ProTag className="flex-shrink-0">{t('sys.login.password')}:</ProTag>
                  <strong className=" ml-1" style={{ color: themeToken.colorInfoTextHover }}>
                    {DEFAULT_USER.password}
                  </strong>
                </div>
              </div>
            }
            showIcon
          />
        </div> */}

        <Form.Item
          name="username"
          rules={[{ required: true, message: t('sys.login.accountPlaceholder') }]}
        >
          <Input placeholder={t('sys.login.userName')} />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: t('sys.login.passwordPlaceholder') }]}
        >
          <Input.Password type="password" placeholder={t('sys.login.password')} />
        </Form.Item>
        <Form.Item>
          <Row align="middle">
            <Col span={12}>
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>{t('sys.login.rememberMe')}</Checkbox>
              </Form.Item>
            </Col>
            <Col span={12} className="text-right">
              <Button
                type="link"
                className="!underline"
                onClick={() => setLoginState(LoginStateEnum.RESET_PASSWORD)}
                size="small"
              >
                {t('sys.login.forgetPassword')}
              </Button>
            </Col>
          </Row>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" className="w-full" loading={loading}>
            {t('sys.login.loginButton')}
          </Button>
        </Form.Item>

        <Row align="middle" gutter={8}>
          {/* <Col span={9} flex="1">
            <Button
              className="w-full !text-sm"
              onClick={() => setLoginState(LoginStateEnum.MOBILE)}
            >
              {t('sys.login.mobileSignInFormTitle')}
            </Button>
          </Col>
          <Col span={9} flex="1">
            <Button
              className="w-full !text-sm"
              onClick={() => setLoginState(LoginStateEnum.QR_CODE)}
            >
              {t('sys.login.qrSignInFormTitle')}
            </Button>
          </Col> */}
          <Col span={18} flex="1">
            <LoginButtonTeams />
          </Col>
          <Col span={24} flex="1" onClick={() => setLoginState(LoginStateEnum.REGISTER)}>
            <Button className="w-full !text-sm">{t('sys.login.signUpFormTitle')}</Button>
          </Col>
        </Row>

        <Divider className="!text-xs">{t('sys.login.otherSignIn')}</Divider>

        <div className="flex cursor-pointer justify-around text-2xl">
          <AiFillGithub />
          <AiFillWechat />
          <AiFillGoogleCircle />
        </div>
      </Form>
    </>
  );
}

export default LoginForm;
