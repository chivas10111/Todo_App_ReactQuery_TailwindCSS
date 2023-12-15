import { Button, Form, Input, Popconfirm, Table, message } from 'antd';
import { useQuery, useMutation } from '@tanstack/react-query';
import { TaskType, addTasks, deleteTask, getTasks } from '../../api/tasks';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { queryClient } from '../../config/query-client';

type FormType = { title: string }

const Tasks = () => {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId');
  const parsedUserId = userId ? parseInt(userId, 10) : undefined; //Chuyển đổi userId từ string sang số
  const [form] = Form.useForm<FormType>()
  const navigate = useNavigate()

  // Hàm xử lý get tasks
  const tasksQuery = useQuery({
    queryKey: ['tasks', parsedUserId],
    queryFn: () => getTasks(parsedUserId),
    enabled: Boolean(parsedUserId),
  });

  // Hàm xử lý add task
  const { mutate: addTaskMutation } = useMutation({
    mutationFn: addTasks,
    onSuccess: () => {
      message.success("Thêm công việc thành công");
      queryClient.invalidateQueries({
        queryKey: ['tasks', parsedUserId],
        type: "all"
      })
    }
  });

  // Hàm xử lý delete task
  const { mutate: deleteTaskMutation } = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      message.success("Xóa công việc thành công");
      queryClient.invalidateQueries({
        queryKey: ['tasks', parsedUserId],
        type: "all"
      })
    }
  });

  const tasks = tasksQuery.data || [];
  const sortedTasks = tasks.sort((a, b) => {
    if (!a.completed && b.completed) {
      return -1;
    }
    if (a.completed && !b.completed) {
      return 1;
    }
    return 0;
  })

  // Hàm xử lý khi click nút add trong form
  const onFinish = (values: FormType) => {
    if (!values.title) return;

    const newTask: TaskType = {
      userId: parsedUserId,
      title: values.title,
      completed: false,
    };

    addTaskMutation(newTask);
    form.setFieldValue("title", "")
  };

  const handleUpdateClick = (taskId: number | undefined) => {
    navigate(`/update/${taskId}`);
  }

  const handleDeleteClick = (taskId: number | undefined) => {
    deleteTaskMutation(taskId);
  }

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
      render: (completed: any) => (completed ? "Done" : "Not done"),
    },
    {
      title: 'Action',
      key: 'action',
      render: (record: TaskType) => (
        <>
          <Button onClick={() => handleUpdateClick(record.id)} className='m-3 bg-green-500 text-white'>Update</Button>
          <Popconfirm title="Are you sure to delete this task?" okText="Yes" cancelText="No" onConfirm={() => handleDeleteClick(record.id)}>
            <Button danger>Delete</Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  // Xử lý lỗi key trong table
  const getRowKey = (record: TaskType) => (record.id ? record.id.toString() : '');

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
        className="mx-auto flex items-center"
      >
        <Form.Item
          name='title'
          rules={[{ required: true, message: 'Please input your task!' }]}
          className="w-full"
        >
          <Input
            placeholder='Enter your task...' 
          />
        </Form.Item>
        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Button type='primary' htmlType='submit'>
            Add
          </Button>
        </Form.Item>
      </Form>
      <Table rowKey={getRowKey} columns={columns} dataSource={sortedTasks} className='border-2 border-solid' bordered/>
    </div>
  );
};

export default Tasks;
