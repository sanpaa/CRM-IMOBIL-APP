import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';

/**
 * Serviço para salvar layouts HTML/CSS grandes usando Supabase Storage
 * Isso evita limitações de payload do PostgREST para dados grandes
 */
@Injectable({
    providedIn: 'root'
})
export class LayoutStorageService {
    private readonly BUCKET_NAME = 'website-layouts';
    private readonly MAX_INLINE_SIZE = 50000; // 50KB - acima disso usa Storage

    constructor(
        private supabase: SupabaseService,
        private authService: AuthService
    ) { }

    /**
     * Salva HTML/CSS - usa Storage se for muito grande
     * Retorna objeto com html/css ou html_url/css_url
     */
    async saveLayoutContent(
        layoutId: string,
        html: string,
        css: string,
        projectData?: any
    ): Promise<{
        html?: string;
        css?: string;
        html_url?: string;
        css_url?: string;
        project_data?: any;
    }> {
        // Tenta obter usuário cacheado
        const user = this.authService.getCurrentUser();
        let companyId = user?.company_id;

        // Verifica sessão Supabase
        const session = await this.supabase.auth.getSession();

        // Se não tiver companyId no cache, tenta da sessão
        if (!companyId && session.data.session?.user) {
            companyId = session.data.session.user.user_metadata?.['company_id'] || session.data.session.user.id;
        }

        // Fallback final: usar 'anon_user' se tudo falhar, permitindo upload via policy pública
        if (!companyId) {
            console.warn('[LayoutStorage] Usuário deslogado. Usando companyId fallback "anon"');
            companyId = session.data.session?.user?.id || 'anon_user';
        }

        const result: any = {};
        const htmlSize = new Blob([html]).size;
        const cssSize = new Blob([css]).size;

        console.log('[LayoutStorage] Tentando salvar:', {
            layoutId,
            companyId,
            hasSession: !!session.data.session,
            userId: session.data.session?.user?.id || 'anon'
        });

        // Salvar HTML
        if (htmlSize > this.MAX_INLINE_SIZE) {
            const htmlPath = `${companyId}/${layoutId}/layout.html`;
            const htmlUrl = await this.uploadToStorage(htmlPath, html, 'text/html');
            result.html_url = htmlUrl;
            result.html = '';
        } else {
            result.html = html;
            result.html_url = null;
        }

        // Salvar CSS
        if (cssSize > this.MAX_INLINE_SIZE) {
            const cssPath = `${companyId}/${layoutId}/layout.css`;
            const cssUrl = await this.uploadToStorage(cssPath, css, 'text/css');
            result.css_url = cssUrl;
            result.css = '';
        } else {
            result.css = css;
            result.css_url = null;
        }

        // Salvar Project Data (JSON)
        if (projectData) {
            const jsonStr = JSON.stringify(projectData);
            const jsonSize = new Blob([jsonStr]).size;

            if (jsonSize > this.MAX_INLINE_SIZE) {
                const jsonPath = `${companyId}/${layoutId}/project.json`;
                const jsonUrl = await this.uploadToStorage(jsonPath, jsonStr, 'application/json');
                // Retorna um objeto especial que o aplicativo saberá interpretar
                result.project_data = { storage_url: jsonUrl };
                console.log('[LayoutStorage] JSON do projeto salvo no Storage:', jsonPath);
            } else {
                result.project_data = projectData;
            }
        }

        return result;
    }

    /**
     * Carrega HTML/CSS - busca do Storage se necessário
     */
    async loadLayoutContent(layout: {
        html?: string;
        css?: string;
        html_url?: string | null;
        css_url?: string | null;
        layout_config?: any;
    }): Promise<{ html: string; css: string; projectData?: any }> {
        let html = layout.html || '';
        let css = layout.css || '';
        let projectData = layout.layout_config || null;

        // Se tiver URL, busca do Storage
        if (layout.html_url && !html) {
            html = await this.downloadFromStorage(layout.html_url);
        }

        if (layout.css_url && !css) {
            css = await this.downloadFromStorage(layout.css_url);
        }

        // Se layout_config for uma referência ao Storage
        if (projectData && projectData.storage_url) {
            console.log('[LayoutStorage] Carregando JSON do projeto do Storage:', projectData.storage_url);
            const jsonStr = await this.downloadFromStorage(projectData.storage_url);
            try {
                if (jsonStr) {
                    projectData = JSON.parse(jsonStr);
                }
            } catch (e) {
                console.error('[LayoutStorage] Erro ao parsear JSON do projeto:', e);
            }
        }

        return { html, css, projectData };
    }

    /**
     * Upload para Supabase Storage
     */
    private async uploadToStorage(path: string, content: string, contentType: string): Promise<string> {
        const blob = new Blob([content], { type: contentType });

        // O bucket deve ser criado via migration/dashboard
        // Não tentamos criar aqui pois usuários normais não têm permissão para criar buckets

        const { data, error } = await this.supabase.storage
            .from(this.BUCKET_NAME)
            .upload(path, blob, {
                cacheControl: '3600',
                upsert: true, // Substitui se já existir
                contentType
            });

        if (error) {
            console.error('[LayoutStorage] Erro no upload:', error);
            throw new Error(`Falha ao salvar no Storage: ${error.message}`);
        }

        console.log('[LayoutStorage] Upload concluído:', data.path);

        // Retorna a URL pública ou signed URL
        const { data: urlData } = this.supabase.storage
            .from(this.BUCKET_NAME)
            .getPublicUrl(path);

        return urlData.publicUrl;
    }

    /**
     * Download do Supabase Storage
     */
    private async downloadFromStorage(url: string): Promise<string> {
        try {
            // Se for URL do Supabase Storage, faz download direto
            if (url.includes(this.BUCKET_NAME)) {
                const path = this.extractPathFromUrl(url);
                const { data, error } = await this.supabase.storage
                    .from(this.BUCKET_NAME)
                    .download(path);

                if (error) {
                    console.error('[LayoutStorage] Erro no download:', error);
                    return '';
                }

                return await data.text();
            }

            // Fallback: fetch normal
            const response = await fetch(url);
            return await response.text();
        } catch (error) {
            console.error('[LayoutStorage] Erro ao carregar:', error);
            return '';
        }
    }

    /**
     * Extrai o path do arquivo da URL completa
     */
    private extractPathFromUrl(url: string): string {
        const bucketIndex = url.indexOf(this.BUCKET_NAME);
        if (bucketIndex === -1) return url;
        return url.substring(bucketIndex + this.BUCKET_NAME.length + 1);
    }

    /**
     * Remove arquivos do Storage quando layout é deletado
     */
    async deleteLayoutContent(layoutId: string): Promise<void> {
        const user = this.authService.getCurrentUser();
        const companyId = user?.company_id;

        if (!companyId) return;

        const folderPath = `${companyId}/${layoutId}`;

        try {
            const { data: files } = await this.supabase.storage
                .from(this.BUCKET_NAME)
                .list(folderPath);

            if (files && files.length > 0) {
                const filesToDelete = files.map(f => `${folderPath}/${f.name}`);
                await this.supabase.storage
                    .from(this.BUCKET_NAME)
                    .remove(filesToDelete);

                console.log('[LayoutStorage] Arquivos removidos:', filesToDelete);
            }
        } catch (error) {
            console.warn('[LayoutStorage] Erro ao limpar Storage:', error);
        }
    }
}
