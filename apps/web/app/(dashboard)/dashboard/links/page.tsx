'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { linksAPI } from '@/lib/api'
import { toast } from 'sonner'
import { Plus, Trash2, Edit, GripVertical, ExternalLink } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export default function LinksPage() {
  const [links, setLinks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingLink, setEditingLink] = useState<any>(null)
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    icon: '',
    isPriority: false,
  })

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    loadLinks()
  }, [])

  const loadLinks = async () => {
    try {
      const response = await linksAPI.getLinks()
      setLinks(response.data.data)
    } catch (error) {
      toast.error('Falha ao carregar links')
    } finally {
      setLoading(false)
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = links.findIndex((link) => link.id === active.id)
      const newIndex = links.findIndex((link) => link.id === over.id)

      const newLinks = arrayMove(links, oldIndex, newIndex)
      setLinks(newLinks)

      try {
        await linksAPI.reorderLinks({
          links: newLinks.map((link, index) => ({
            id: link.id,
            order: index + 1,
          })),
        })
        toast.success('Links reordenados')
      } catch (error) {
        toast.error('Falha ao reordenar links')
        loadLinks()
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingLink) {
        await linksAPI.updateLink(editingLink.id, formData)
        toast.success('Link atualizado')
      } else {
        await linksAPI.createLink(formData)
        toast.success('Link criado')
      }

      setDialogOpen(false)
      resetForm()
      loadLinks()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Falha ao salvar link')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este link?')) return

    try {
      await linksAPI.deleteLink(id)
      toast.success('Link excluído')
      loadLinks()
    } catch (error) {
      toast.error('Falha ao excluir link')
    }
  }

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      await linksAPI.updateLink(id, { isActive })
      loadLinks()
    } catch (error) {
      toast.error('Falha ao atualizar link')
    }
  }

  const openDialog = (link?: any) => {
    if (link) {
      setEditingLink(link)
      setFormData({
        title: link.title,
        url: link.url,
        description: link.description || '',
        icon: link.icon || '',
        isPriority: link.isPriority,
      })
    }
    setDialogOpen(true)
  }

  const resetForm = () => {
    setEditingLink(null)
    setFormData({
      title: '',
      url: '',
      description: '',
      icon: '',
      isPriority: false,
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Links</h1>
          <p className="text-muted-foreground">Gerencie seus links e reordene-os arrastando</p>
        </div>
        <Button onClick={() => openDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Link
        </Button>
      </div>

      {links.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">Nenhum link ainda. Crie seu primeiro link!</p>
            <Button onClick={() => openDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Link
            </Button>
          </CardContent>
        </Card>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={links.map((l) => l.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {links.map((link) => (
                <SortableLinkItem
                  key={link.id}
                  link={link}
                  onEdit={openDialog}
                  onDelete={handleDelete}
                  onToggle={handleToggle}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open)
        if (!open) resetForm()
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingLink ? 'Editar Link' : 'Adicionar Novo Link'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Meu link incrível"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">URL *</Label>
              <Input
                id="url"
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://exemplo.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição opcional"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="icon">Ícone (emoji)</Label>
              <Input
                id="icon"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="🎉"
                maxLength={2}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="priority">Link Prioritário</Label>
              <Switch
                id="priority"
                checked={formData.isPriority}
                onCheckedChange={(checked) => setFormData({ ...formData, isPriority: checked })}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                {editingLink ? 'Atualizar' : 'Criar'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDialogOpen(false)
                  resetForm()
                }}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function SortableLinkItem({
  link,
  onEdit,
  onDelete,
  onToggle,
}: {
  link: any
  onEdit: (link: any) => void
  onDelete: (id: string) => void
  onToggle: (id: string, isActive: boolean) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: link.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <Card ref={setNodeRef} style={style}>
      <CardContent className="py-4">
        <div className="flex items-center gap-4">
          <button
            className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-5 w-5" />
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {link.icon && <span className="text-lg">{link.icon}</span>}
              <h3 className="font-medium truncate">{link.title}</h3>
              {link.isPriority && (
                <span className="px-2 py-0.5 bg-yellow-400 text-black text-xs rounded-full font-bold">
                  NEW
                </span>
              )}
            </div>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:underline flex items-center gap-1"
            >
              {link.url}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={link.isActive}
              onCheckedChange={(checked) => onToggle(link.id, checked)}
            />
            <Button size="sm" variant="ghost" onClick={() => onEdit(link)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onDelete(link.id)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
