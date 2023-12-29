import { Button, Form, Input, Popconfirm, Table, message, Select, Space, Radio } from 'antd';
import { useQuery, useMutation } from '@tanstack/react-query';
import { TaskType, addTasks, deleteTask, getTasks } from '../../api/tasks';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { queryClient } from '../../config/query-client';
import { useState } from 'react';
import useSetParam from '../../shared/hooks/use-set-param';
import {debounce} from 'lodash';


const { Option } = Select;
const { Search } = Input;

type FormType = { title: string };

const Tasks = () => {
  const setParam = useSetParam();
  const [searchParams, ] = useSearchParams();
  const userId = searchParams.get('userId');
  const completedParam = searchParams.get('completed') ?? undefined;
  const completed = completedParam ? completedParam === 'true' : completedParam as undefined;
  const parsedUserId = userId ? parseInt(userId, 10) : undefined;
  const [form] = Form.useForm<FormType>();
  const navigate = useNavigate();
  const [limit, setLimit] = useState(10);
  const pageParam = searchParams.get('page');
  const page = pageParam ? parseInt(pageParam, 10) : 1;
  const search = searchParams.get('search') ?? undefined;
  const queryKey = ['tasks', parsedUserId, page, limit, completed, search];


  // Hàm xử lý get tasks
  const tasksQuery = useQuery({
    queryKey: queryKey,
    queryFn: () => getTasks(parsedUserId, { page, limit, completed, search_query:search}),
    enabled: Boolean(parsedUserId),
  });

  // Hàm xử lý add task
  const { mutate: addTaskMutation } = useMutation({
    mutationFn: addTasks,
    onSuccess: () => {
      message.success('Thêm công việc thành công');
      queryClient.invalidateQueries({
        queryKey: queryKey,
        type: 'all',
      });
    },
  });

  // Hàm xử lý delete task
  const { mutate: deleteTaskMutation } = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      message.success('Xóa công việc thành công');
      queryClient.invalidateQueries({
        queryKey: queryKey,
        type: 'all',
      });
    },
  });

  const tasks = tasksQuery.data || [];

  // Hàm xử lý khi click nút add trong form
  const onFinish = (values: FormType) => {
    if (!values.title) return;

    const newTask: TaskType = {
      userId: parsedUserId,
      title: values.title,
      completed: false,
    };

    addTaskMutation(newTask);
    form.setFieldValue('title', '');
  };

  const handleUpdateClick = (taskId: number | undefined) => {
    navigate(`/update/${taskId}`);
  };

  const handleDeleteClick = (taskId: number | undefined) => {
    deleteTaskMutation(taskId);
  };

  // Định nghĩa colum cho table
  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Status',
      dataIndex: 'completed',
      key: 'completed',
      render: (completed: any) => (completed ? 'Done' : 'Not done'),
    },
    {
      title: 'Action',
      key: 'action',
      render: (record: TaskType) => (
        <>
          <Button onClick={() => handleUpdateClick(record.id)} className='m-3 bg-green-500 text-white'>Update</Button>
          <Popconfirm title='Are you sure to delete this task?' okText='Yes' cancelText='No' onConfirm={() => handleDeleteClick(record.id)}>
            <Button danger>Delete</Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  // Xử lý lỗi key trong table
  const getRowKey = (record: TaskType) => (record.id ? record.id.toString() : '');

  // Xử lý khi bấm nút Prev
  const handlePrevClick = () => {
    if (page > 1) {
      setParam({
        'page': page - 1
      });
    }
  };

  // Xử lý khi bấm nút Next
  const handleNextClick = () => {
    if (tasks.length === limit) {
      setParam({
        'page': page + 1
      });
    }
  };

  // Xử lý khi thay đổi kích thước trang
  const handlePageSizeChange = (value: string) => {
    setLimit(Number(value));
    setParam({
      'page': 1
    });
  };

  // Xử lý search task
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value.toLowerCase();
    setParam({
      'search': query||undefined,
      'page': 1
    });
  };

  // Xử lý các trường hợp khi không load được danh sách task và khi người dùng không chọn user thì không hiện task
  if (parsedUserId === undefined) return null;
  if (tasksQuery.isLoading) return <h1>Loading...</h1>;
  if (tasksQuery.isError) {
    return <h1>{JSON.stringify(tasksQuery.error)}</h1>;
  }

  return (
    <div>
      <br />
      <Form
        form={form}
        name='basic'
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        style={{ maxWidth: 600 }}
        initialValues={{ remember: true }}
        onFinish={onFinish}
        autoComplete='off'
        className='mx-auto flex items-center'
      >
        <Form.Item
          name='title'
          rules={[{ required: true, message: 'Please input your task!' }]}
          className='w-full'
        >
          <Input placeholder='Enter your task...' />
        </Form.Item>
        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Button type='primary' htmlType='submit'>
            Add
          </Button>
        </Form.Item>
      </Form>
      <Space className="space-search p-2">
        <Search
          placeholder="Search by title"
          // value={search}
           defaultValue={search}
          onChange={debounce(handleSearch, 500)}
          style={{
            width: 600,
          }}
        />
      </Space>
        <Radio.Group onChange={(e) => setParam({'completed': e.target.value})} defaultValue={completed}>
          <Radio value={true}>Done</Radio>
          <Radio value={false}>Not done</Radio>
          <Radio value={undefined}>All</Radio>
        </Radio.Group>
      <Table rowKey={getRowKey} columns={columns} dataSource={tasks} className='border-2 border-solid' bordered pagination={false} />
      <div className='flex justify-between items-center mt-3'>
        <div className='flex justify-center items-center p-1.5'>
          <Button onClick={handlePrevClick} disabled={page === 1}>
            Prev
          </Button>
          <p className='bg-blue-700 p-3 m-3'>{page}</p>
          <Button onClick={handleNextClick} disabled={tasks.length < limit}>
            Next
          </Button>
        </div>
        <div>
          <span>Show </span>
          <Select defaultValue='10' style={{ width: 70 }} onChange={handlePageSizeChange}>
            <Option value='10'>10</Option>
            <Option value='20'>20</Option>
            <Option value='50'>50</Option>
            <Option value='100'>100</Option>
          </Select>
          <span> per page</span>
        </div>
      </div>
    </div>
  );
};

export default Tasks;


//Giai thich ham debounce
//khi thuc hien mot hanh dong nao do se khoi tao mot id
//nếu mà hành động chậm hơn thời gian time out thì sẽ chạy hàm callback (hành động)
//nếu mà hành động nhanh hơn thời gian time out thì sẽ cancel callback (hành động)
// const debounce2 = (callback: (param: any) => void, timeout: number)=> {
//   let timeoutId:number|null = null

//   return (param: any) => {
//     if(timeoutId) {
//       clearTimeout(timeoutId) //cancel hanh dong truoc do
//     }
    
    
//     timeoutId = setTimeout(()=> {
//       callback(param)
//     }, timeout)
//   }
// }