import { createClient } from '@/lib/supabase/server'

export async function getComments(contentId: string, contentType: string = 'news') {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('comments')
        .select(`
            *,
            user:profiles(id, username, display_name, avatar_url)
        `)
        .eq('content_id', contentId)
        .eq('content_type', contentType)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching comments:', error)
        return []
    }
    return data
}

export async function addComment(contentId: string, userId: string, body: string, contentType: string = 'news') {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('comments')
        .insert({
            content_id: contentId,
            content_type: contentType,
            user_id: userId,
            body: body
        })
        .select()
        .single()

    if (error) {
        throw error
    }
    return data
}

export async function toggleLike(contentId: string, userId: string, contentType: string = 'news') {
    const supabase = await createClient()
    
    // Check if already liked
    const { data: existing } = await supabase
        .from('reactions')
        .select('id')
        .eq('content_id', contentId)
        .eq('user_id', userId)
        .eq('content_type', contentType)
        .maybeSingle() // Use maybeSingle to avoid 406 errors

    if (existing) {
        // Unlike: Delete reaction
        const { error: deleteError } = await supabase
            .from('reactions')
            .delete()
            .eq('id', existing.id)
        
        if (!deleteError && contentType === 'news') {
            await supabase.rpc('increment_likes', { p_table: 'news', p_id: contentId, p_amount: -1 })
        }
        return { liked: false }
    } else {
        // Like: Insert reaction (Unique constraint will prevent duplicates anyway)
        const { error: insertError } = await supabase
            .from('reactions')
            .insert({
                content_id: contentId,
                user_id: userId,
                content_type: contentType,
                reaction: 'like'
            })
        
        if (!insertError && contentType === 'news') {
            await supabase.rpc('increment_likes', { p_table: 'news', p_id: contentId, p_amount: 1 })
        }
        return { liked: true }
    }
}
