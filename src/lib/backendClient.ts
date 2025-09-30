import localBackend from './backend';
import apiBackend from './backendApi';

const API_BASE = (import.meta as any).env?.VITE_API_BASE as string | undefined;

const backend = API_BASE ? apiBackend : localBackend;

export default backend;

