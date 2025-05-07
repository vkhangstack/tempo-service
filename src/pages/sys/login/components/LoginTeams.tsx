import { useMsal } from '@azure/msal-react';
import { Button } from 'antd';

import { loginRequest } from '@/utils/msteams';

export function LoginButtonTeams() {
  const { instance } = useMsal();

  const handleLogin = () => {
    instance
      .loginPopup(loginRequest)
      .then((res) => {
        console.log('res', res);
      })
      .catch((e) => {
        console.error(e);
      });
  };

  return (
    <Button className="w-full !text-sm" onClick={handleLogin}>
      Login Microsoft Teams
    </Button>
  );
}
