import { config } from 'dotenv';
config();
import { getTodayRugby, getRecentRugby } from './src/lib/api/rapid';

async function run() {
    const today = await getTodayRugby();
    console.log('Today:', today.length);
    const recent = await getRecentRugby();
    console.log('Recent:', recent.length);
}
run();
