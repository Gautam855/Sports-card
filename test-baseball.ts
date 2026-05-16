

import { getLiveBaseball, getTodayBaseball, getRecentBaseball, getRealBaseballStandings } from './src/lib/api/rapid';

async function test() {
    console.log('--- Testing Baseball API ---');
    const live = await getLiveBaseball();
    console.log('Live matches:', live.length);
    if (live.length > 0) console.log('First live match status:', live[0].status);

    const today = await getTodayBaseball();
    console.log('Today matches:', today.length);
    const completedToday = today.filter(m => m.status === 'completed');
    console.log('Completed matches today:', completedToday.length);

    const recent = await getRecentBaseball();
    console.log('Recent matches (yesterday):', recent.length);

    const standings = await getRealBaseballStandings();
    console.log('Standings found:', !!standings);
}

test();
