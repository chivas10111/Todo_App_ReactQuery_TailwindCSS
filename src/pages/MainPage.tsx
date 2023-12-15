import User from '../components/User/User'
import Tasks from '../components/Tasks/Tasks'

const MainPage = () => {
  return (
    <>
        <h1 className='text-3xl font-bold underline'>Todo App</h1>
        <User/>
        <Tasks/>
    </>
  )
}

export default MainPage