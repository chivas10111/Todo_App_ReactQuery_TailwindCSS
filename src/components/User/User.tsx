import React from 'react';
import { Select } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { getUsers } from '../../api/users';
import { useSearchParams } from 'react-router-dom';
import useSetParam from '../../shared/hooks/use-set-param';

const { Option } = Select;

const User: React.FC = () => {
  const setParam = useSetParam();
  const [searchParams, ] = useSearchParams();
  const currentUserId = searchParams.get("userId");
  const parseCurrentUserId = currentUserId ? parseInt(currentUserId, 10) : undefined;

  // Hàm get user
  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  })

  // Hàm lấy userId để cho component Task lấy được userId để hiển thị task của người đó
  const handleUserChange = (userId: number) => {
    setParam({'userId': userId.toString()});
  }

  // Xử lý các trường hợp khi không load được danh sách user
  if (usersQuery.status === "pending") return <h1>Loading...</h1>
  if (usersQuery.status === "error") {
    return <h1>{JSON.stringify(usersQuery.error)}</h1>
  }

  return (
    <Select
      showSearch
      style={{ width: 300 }}
      placeholder="Select user"
      optionFilterProp="children"
      onChange={handleUserChange}
      defaultValue={parseCurrentUserId}
    >
      {usersQuery.data.map((item) => (
        <Option key={item.id} value={item.id}>
          {item.name}
        </Option>
      ))}
    </Select>
  );
};

export default User;