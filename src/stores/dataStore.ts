import { defineStore } from 'pinia';
import { ref } from 'vue';
import { userService } from '@/api/services/user.service';
import { authService } from '@/api/services/auth.service';
import { DepartmentService } from '@/api/services/department.service';
import { reportService } from '@/api/services/report.service';
import type { BiometricUser } from '@/api/types/users.types';
import type { Department } from '@/api/types/department.types';

export const useDataStore = defineStore('data', () => {
    // State
    const users = ref<BiometricUser[]>([]);
    const authUsers = ref<any[]>([]); // Using any[] based on previous integration logic
    const departments = ref<Department[]>([]);
    
    const loadingUsers = ref(false);
    const loadingAuth = ref(false);
    const loadingDepartments = ref(false);

    const lastFetchUsers = ref<number>(0);
    const lastFetchAuth = ref<number>(0);
    const lastFetchDepartments = ref<number>(0);

    // Metrics Cache
    const metrics = ref({
        puntual: 0,
        tardanzas: 0,
        faltas: 0,
        horas_extras: 0,
    });
    const attendanceRecords = ref<any[]>([]);
    const lastMetricsParams = ref<string>(""); // Key: "fechaDesde|fechaHasta"

    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    // Actions
    const fetchUsers = async (force = false) => {
        const now = Date.now();
        if (!force && users.value.length > 0 && (now - lastFetchUsers.value < CACHE_DURATION)) {
            return;
        }

        try {
            loadingUsers.value = true;
            const response = await userService.getAll();
             // @ts-ignore
            const rawUsers = response.data?.data || response.data || [];
            if (Array.isArray(rawUsers)) {
                users.value = rawUsers;
                lastFetchUsers.value = now;
            }
        } catch (error) {
            console.error('Store: Error fetching users', error);
        } finally {
            loadingUsers.value = false;
        }
    };

    const fetchAuthUsers = async (force = false) => {
        const now = Date.now();
        if (!force && authUsers.value.length > 0 && (now - lastFetchAuth.value < CACHE_DURATION)) {
            return;
        }

        try {
            loadingAuth.value = true;
            const response = await authService.getAllUsers();
            // @ts-ignore
            const rawAuth = (response.data as any)?.data || (response.data as any)?.users || response.data || [];
            if (Array.isArray(rawAuth)) {
                authUsers.value = rawAuth;
                lastFetchAuth.value = now;
            }
        } catch (error) {
            console.error('Store: Error fetching auth users', error);
        } finally {
            loadingAuth.value = false;
        }
    };

    const fetchDepartments = async (force = false) => {
        const now = Date.now();
        if (!force && departments.value.length > 0 && (now - lastFetchDepartments.value < CACHE_DURATION)) {
            return;
        }

        try {
            loadingDepartments.value = true;
            const response = await DepartmentService.getAll();
             // @ts-ignore
            const rawDepts = response.data?.data || response.data || [];
            if (Array.isArray(rawDepts)) {
                departments.value = rawDepts;
                lastFetchDepartments.value = now;
            }
        } catch (error) {
            console.error('Store: Error fetching departments', error);
        } finally {
            loadingDepartments.value = false;
        }
    };

    const fetchMetrics = async (fechaDesde: string, fechaHasta: string) => {
        const key = `${fechaDesde}|${fechaHasta}`;
        if (lastMetricsParams.value === key && (attendanceRecords.value.length > 0 || metrics.value.puntual > 0)) {
            // Cache hit
            return;
        }

        try {
            const response = await reportService.getAttendanceMetrics(fechaDesde, fechaHasta);
             // @ts-ignore
            const data = response.data?.totales || response.data || {};
             // @ts-ignore
            const rawData = response.data?.data || [];

            attendanceRecords.value = rawData;
            metrics.value = {
                puntual: data.puntual || 0,
                tardanzas: data.tardanzas || 0,
                faltas: data.faltas || 0,
                horas_extras: data.horas_extras || 0,
            };
            lastMetricsParams.value = key;
        } catch (error) {
            console.error('Store: Error fetching metrics', error);
        }
    };

    const fetchAll = async (force = false) => {
        await Promise.all([
            fetchUsers(force),
            fetchAuthUsers(force),
            fetchDepartments(force)
        ]);
    };

    return {
        users,
        authUsers,
        departments,
        loadingUsers,
        loadingAuth,
        loadingDepartments,
        fetchUsers,
        fetchAuthUsers,
        fetchDepartments,
        fetchAll,
        metrics,
        attendanceRecords,
        fetchMetrics
    };
});
