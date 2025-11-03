import Tooltip from '@/components/Tooltip'
import { useNavigate } from 'react-router-dom'
import IconCloudUpload from '~icons/tabler/cloud-upload'

export default function DictImportButton() {
  const navigate = useNavigate()

  return (
    <Tooltip content="导入自定义词典">
      <button
        onClick={() => navigate('/dict-import')}
        className="flex items-center justify-center rounded p-[2px] text-lg text-indigo-500 outline-none transition-colors duration-300 ease-in-out hover:bg-indigo-400 hover:text-white"
        title="导入自定义词典"
      >
        <IconCloudUpload className="icon" />
      </button>
    </Tooltip>
  )
}
