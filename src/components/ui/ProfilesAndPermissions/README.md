# Design System - Agenda Saúde

Este diretório contém os componentes UI reutilizáveis do sistema, criados com Tailwind CSS para manter consistência visual em todas as páginas.

## 🎨 Componentes Disponíveis

### PageHeader

Cabeçalho padronizado para todas as páginas.

```tsx
import { PageHeader } from '../ui';
import { Shield } from 'lucide-react';

<PageHeader
  title="Título da Página"
  subtitle="Descrição da página"
  icon={Shield}
  searchValue={searchTerm}
  onSearchChange={setSearchTerm}
  hasChanges={hasUnsavedChanges}
  onSave={saveChanges}
  onCancel={cancelChanges}
  saving={saving}
/>
```

### PermissionCard

Card para exibir permissões individuais com estado ativo/inativo.

```tsx
import { PermissionCard } from '../ui';

<PermissionCard
  permission="user_create"
  isActive={isPermissionActive}
  onChange={togglePermission}
  size="md"
/>
```

### PermissionCategory

Container expansível para agrupar permissões por categoria.

```tsx
import { PermissionCategory } from '../ui';

<PermissionCategory
  category={categoryData}
  activePermissions={userPermissions}
  onPermissionChange={handlePermissionChange}
  defaultExpanded={true}
/>
```

### RoleTab

Aba para seleção de roles com estatísticas visuais.

```tsx
import { RoleTab } from '../ui';

<RoleTab
  role="ADMIN"
  label="Administrador"
  description="Acesso administrativo completo"
  isActive={selectedRole === 'ADMIN'}
  permissionCount={25}
  totalPermissions={50}
  hasChanges={hasUnsavedChanges}
  onClick={() => setSelectedRole('ADMIN')}
/>
```

## 🎯 Padrões Visuais

### Cores por Ação

- **View/Read**: Azul (`blue-500`)
- **Create**: Verde (`green-500`)
- **Edit/Update**: Amarelo (`yellow-500`)
- **Delete**: Vermelho (`red-500`)
- **Manage**: Laranja (`orange-500`)
- **Export**: Índigo (`indigo-500`)

### Gradientes por Grupo

- **Sistema Principal**: `from-blue-500 to-blue-600`
- **Área Médica**: `from-emerald-500 to-emerald-600`
- **Detalhes Clínicos**: `from-purple-500 to-purple-600`
- **Gestão**: `from-orange-500 to-orange-600`
- **Sistema**: `from-slate-500 to-slate-600`

### Animações

Todos os componentes incluem:
- Transitions suaves (200-300ms)
- Hover effects com escala (scale-105)
- Estados de loading com animações
- Feedbacks visuais para interações

## 🛠️ Estrutura de Dados

### PermissionGroup

```tsx
interface PermissionGroup {
  key: string;
  name: string;
  icon: React.ComponentType;
  color: string;
  gradient: string;
  description: string;
  categories: PermissionCategory[];
}
```

### PermissionCategory

```tsx
interface PermissionCategory {
  key: string;
  name: string;
  icon: React.ComponentType;
  color: string;
  description: string;
  permissions: string[];
}
```

## 📚 Utilitários

### Helpers de Permissão

```tsx
import { 
  getPermissionDisplayName,
  getPermissionCategory,
  calculatePermissionStats,
  filterPermissions,
  validatePermissions
} from '../../utils/permissionHelpers';

// Nome amigável
const displayName = getPermissionDisplayName('user_create'); // "Criar Usuários"

// Categoria da permissão
const category = getPermissionCategory('user_create'); // "users"

// Estatísticas
const stats = calculatePermissionStats(allPermissions, userPermissions);
```

## 🎨 Classes CSS Reutilizáveis

### Cards e Containers

```css
/* Card padrão */
.card-default {
  @apply bg-white rounded-2xl shadow-sm border border-gray-200;
}

/* Card com hover */
.card-interactive {
  @apply bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200 cursor-pointer;
}

/* Container principal */
.container-main {
  @apply min-h-screen bg-gray-50;
}
```

### Botões

```css
/* Botão primário */
.btn-primary {
  @apply bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg;
}

/* Botão secundário */
.btn-secondary {
  @apply border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-medium px-4 py-2 rounded-lg transition-colors duration-200;
}
```

## 🚀 Como Usar em Novas Páginas

1. **Importe o PageHeader** para consistência
2. **Use os componentes UI** apropriados
3. **Siga os padrões de cor** por tipo de ação
4. **Implemente estados de loading** e feedback
5. **Use os helpers** para lógica de permissões

### Exemplo Completo

```tsx
import React, { useState } from 'react';
import { Users } from 'lucide-react';
import { PageHeader } from '../ui';
import { getPermissionDisplayName } from '../../utils/permissionHelpers';

const MinhaNovaPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Minha Nova Página"
        subtitle="Descrição da funcionalidade"
        icon={Users}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
      />
      
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Conteúdo da página */}
        </div>
      </div>
    </div>
  );
};
```

## 📝 Contribuindo

Ao criar novos componentes:

1. Mantenha consistência com Tailwind CSS
2. Inclua animações suaves
3. Implemente estados de loading/erro
4. Documente props e tipos
5. Teste responsividade
6. Siga padrões de acessibilidade 