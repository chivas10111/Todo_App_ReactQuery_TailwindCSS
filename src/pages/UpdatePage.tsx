import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Input, Button, message, Radio } from 'antd';
import { useQuery, useMutation } from '@tanstack/react-query';
import { updateTasks, getTask } from '../api/tasks';
import { queryClient } from '../config/query-client';

type UpdateTaskProps = {};

const UpdateTask: React.FC<UpdateTaskProps> = () => {
  const { taskId }: { taskId?: string } = useParams();
  const parsedTaskId = taskId ? parseInt(taskId, 10) : undefined;
  const navigate = useNavigate();
  const [form] = Form.useForm();

  // Hàm xử lý get task
  const { data: task, isLoading, isError } = useQuery({
    queryKey: ['task', parsedTaskId],
    queryFn: () => getTask(parsedTaskId),
    enabled: Boolean(parsedTaskId),
  });

  // Hàm xử lý update task
  const { mutate: updateTaskMutation } = useMutation({
    mutationFn: updateTasks,
    onSuccess: (data) => {
      message.success('Cập nhật công việc thành công');
      navigate(-1);
      queryClient.invalidateQueries({
        queryKey: ['tasks', data.userId],
        type: "all"
      })
      queryClient.invalidateQueries({
        queryKey: ['task', parsedTaskId],
        type: "all"
      })
    },
  });

  // Hàm xử lý khi click nút update trong form
  const onFinish = (values: any) => {
    updateTaskMutation({ ...task, ...values });
  };

  // Xử lý các trường hợp khi không lấy được taskID
  if (parsedTaskId === undefined) return null;
  if (isLoading) return <h1>Loading...</h1>;
  if (isError) {
    return <h1>{JSON.stringify(isError)}</h1>;
  }

  return (
    <div className="flex items-center justify-center w-full max-w-md mt-20 mx-auto">
      <Form form={form} initialValues={{ title: task?.title, completed: Boolean(task?.completed) }} onFinish={onFinish} className="w-full">
        <Form.Item label="Title" name="title">
          <Input />
        </Form.Item>
        <Form.Item label="Status" name="completed" >
          <Radio.Group >
            <Radio value={true}>Done</Radio>
            <Radio value={false}>Not done</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Update
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default UpdateTask;