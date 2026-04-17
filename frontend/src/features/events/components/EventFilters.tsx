import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';

interface EventFiltersProps {
  status: string;
  category: string;
  sortBy: string;
  onStatusChange: (status: string) => void;
  onCategoryChange: (category: string) => void;
  onSortChange: (sort: string) => void;
  onClear: () => void;
}

export const EventFilters = ({
  status,
  category,
  sortBy,
  onStatusChange,
  onCategoryChange,
  onSortChange,
  onClear,
}: EventFiltersProps) => {
  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4 mb-6">
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <Select
            label="Estado"
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="published">Publicado</option>
            <option value="draft">Borrador</option>
            <option value="cancelled">Cancelado</option>
            <option value="completed">Completado</option>
          </Select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <Select
            label="Categoría"
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
          >
            <option value="">Todas las categorías</option>
            <option value="tecnologia">Tecnología</option>
            <option value="deportes">Deportes</option>
            <option value="arte">Arte y Cultura</option>
            <option value="musica">Música</option>
            <option value="educacion">Educación</option>
            <option value="negocios">Negocios</option>
            <option value="salud">Salud y Bienestar</option>
            <option value="gastronomia">Gastronomía</option>
            <option value="otro">Otro</option>
          </Select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <Select
            label="Ordenar por"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
          >
            <option value="date_asc">Fecha (más próximo)</option>
            <option value="date_desc">Fecha (más lejano)</option>
            <option value="capacity_asc">Capacidad (menor a mayor)</option>
            <option value="capacity_desc">Capacidad (mayor a menor)</option>
            <option value="availability">Disponibilidad</option>
          </Select>
        </div>

        <Button
          variant="primary"
          onClick={onClear}
          className="whitespace-nowrap"
        >
          Limpiar Filtros
        </Button>
      </div>
    </div>
  );
};
