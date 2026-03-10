import dynamic from 'next/dynamic'
const App = dynamic(() => import('../components/VisaRun'), { ssr: false })
export default function Home() { return <App /> }
