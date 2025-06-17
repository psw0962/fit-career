import { v4 as uuidv4 } from 'uuid';
import {
  ICellRendererParams,
  IRowNode,
  NewValueParams,
  ValueFormatterParams,
  ValueGetterParams,
  ValueSetterParams,
} from 'ag-grid-community';

export const columnDefs = [
  {
    headerName: 'ID',
    field: 'id',
    editable: false,
    hide: true,
  },
  {
    headerName: '',
    width: 60,
    lockPosition: true,
    sortable: false,
    resizable: false,
    headerComponent: 'gripHeader',
    cellRenderer: 'gripCell',
  },
  {
    headerName: 'Name',
    field: 'name',
    editable: true,
    cellEditor: 'agTextCellEditor',
    valueFormatter: (params: ValueFormatterParams) => {
      return params.value || '';
    },
  },
  {
    headerName: 'Email',
    field: 'email',
    editable: true,
    cellEditor: 'agTextCellEditor',
    valueFormatter: (params: ValueFormatterParams) => {
      return params.value || '';
    },
  },
  {
    headerName: 'Active',
    field: 'active',
    editable: true,
    width: 80,
    cellEditor: 'agCheckboxCellEditor',
  },
  {
    headerName: 'Organization',
    field: 'organization',
    editable: false,
    width: 120,
    cellEditor: 'agTextCellEditor',
    cellRenderer: () => {
      return (
        <button className='w-fit flex items-center justify-center bg-[#4C71BF] text-white text-xs font-bold py-1 px-2 rounded'>
          설정
        </button>
      );
    },
    onCellValueChanged: (params: NewValueParams) => {
      return params.node?.setSelected(true);
    },
  },
  {
    headerName: 'Employee Type',
    field: 'employee_type',
    editable: true,
    width: 140,
    cellEditor: 'agSelectCellEditor',
    cellEditorParams: {
      values: ['Full-time', 'Part-time', 'Intern'],
    },
    cellRenderer: (params: ICellRendererParams) => {
      return (
        <div className='flex items-center justify-between w-[90%]'>
          <span>{params.value || ''}</span>
          <span className='ag-icon ag-icon-small-down' role='presentation'></span>
        </div>
      );
    },
  },
];

export const defaultRow = {
  id: uuidv4(),
  name: '',
  email: '',
  active: false,
  organization: null,
  employee_type: '',
};

export const gridData = [
  {
    id: uuidv4(),
    name: 'John',
    email: 'john@example.com',
    active: true,
    organization: null,
    employee_type: 'Full-time',
  },
  {
    id: uuidv4(),
    name: 'Nick',
    email: 'nick@example.com',
    active: true,
    organization: 1,
    employee_type: 'Part-time',
  },
  {
    id: uuidv4(),
    name: 'Tom',
    email: 'tom@example.com',
    active: true,
    organization: 1,
    employee_type: 'Intern',
  },
  {
    id: uuidv4(),
    name: 'Jane',
    email: 'jane@example.com',
    active: true,
    organization: 1,
    employee_type: 'Full-time',
  },
];
