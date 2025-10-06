export interface CreateAnnouncementDto {
    title: string;
    description: string;
    details: string;
    /** URLs des images/vidéos de la galerie */
    gallery?: string[];
    date: string;
    type: 'news' | 'press_release' | 'announcement' | 'communique';
    poster?: string;
    /** Commentaires/réactions */
    comments?: string[];
    /** Tags pour catégorisation */
    tags?: string[];
}
export interface UpdateAnnouncementDto {
    title?: string;
    description?: string;
    details?: string;
    /** URLs des images/vidéos de la galerie */
    gallery?: string[];
    date?: string;
    type?: 'news' | 'press_release' | 'announcement' | 'communique';
    poster?: string;
    /** Commentaires/réactions */
    comments?: string[];
    /** Tags pour catégorisation */
    tags?: string[];
}
export interface AddCommentDto {
    comment: string;
}
//# sourceMappingURL=types.d.ts.map