import Cookies from "universal-cookie";
import { mainConfig } from "./appConfig";
import { supabase } from "../../supabaseClient";
import axios from "axios";

export const generalFunction = {
    getUserId : () => {
        let userId = localStorage.getItem("questUserId");
        return userId;
    },

    getUserToken: () => {
        let token = localStorage.getItem("questUserToken");
        return token;
    },

    showLoader: () => {
        let loader = document.querySelector("#loader");
        loader.style.display = "flex";
    },

    hideLoader: () => {
        let loader = document.querySelector("#loader");
        loader.style.display = "none";
    },

    getUserCredentials: () => {
        let questUserCredentials = JSON.parse(localStorage.getItem("questUserCredentials"));
        return questUserCredentials;
    },

    logout: () => {
        let cookies = new Cookies();
        cookies.remove("questUserId");
        cookies.remove("questUserToken");
        cookies.remove("questUserCredentials");
        localStorage.removeItem("questUserId");
        localStorage.removeItem("questUserToken");
        localStorage.removeItem("questUserCredentials");
        localStorage.removeItem("adminDetails");
    },

    createUrl: (apiString) => {
        const url = `${mainConfig.QUEST_BASE_URL}${apiString}`;
        const headers = {
            apiKey: mainConfig.QUEST_API_KEY,
            userId: generalFunction.getUserId(),
            token: generalFunction.getUserToken()
        };
    
        return {
            url,
            headers,
        };
    },

    createDefaultRoles: async (entityId, apiKey) => {
        let request = generalFunction.createUrl(`api/entities/${entityId}/roles?userId=${generalFunction.getUserId()}`);
        let responses = await Promise.all(["OWNER", "ADMIN", "TEAM MANAGER", "FIELD MANAGER"].map((role) => {
            axios.post(request.url, {role}, { headers: {...request.headers, apiKey: apiKey} })
        }));
        console.log(responses);
    },

    count: 0,

    uploadImageToBackend: async (file) => {
        if (!file) {
            return null;
        }
        if (file.size > 1000000 && generalFunction.count <= 50) {
            try {
                // Resize the image to below 1MB
                const compressedImage = await imageCompression(file, {
                    maxSizeMB: 1,
                    maxWidthOrHeight: 1024,
                    useWebWorker: true,
                    initialQuality: 1 - (generalFunction.count * 0.05),
                });
                generalFunction.count++

                // Call the uploadImageToBackend function recursively with the compressed image
                return await generalFunction.uploadImageToBackend(compressedImage);
            } catch (error) {
                return null;
            }
        }

        const { url, headers: baseHeaders } = generalFunction.createUrl(`api/upload-img`);
        const headers = {
            ...baseHeaders,
            "Content-Type": "form-data",
        };

        const formData = new FormData();
        formData.append("uploaded_file", file);

        try {
            const res = await axios.post(url, formData, { headers });
            return res;
        } catch (error) {
            return null;
        }
    },

    fetchCommunities: async (userId) => {
        let request = generalFunction.createUrl(`api/users/${userId}/admin-entities`);
        try {
            const response = await axios.get(request.url, { headers: { ...request.headers, apikey: mainConfig.API_KEY } });
            if (response.data.success === false) {
                return response.data
            }

            if (response.data.success === true) {
                if (response.data.data.length == 0) {
                    return response.data;
                }
                let comm = response?.data?.data.filter((ele) => ele.parentEntityId == undefined)
                return { success: true, data: comm };
            }
        } catch (error) {
            return { success: false, loginAgain: true };
        }
    },

    supabase_getUser: async (email) => {
        const { data, error } = await supabase
            .from('users')
            .select()
            .eq('email', email);
        if (error) {
            throw error;
        }
        return data;
    },

    supabase_addData: async (table, rowData) => {
        const { data, error } = await supabase.from(table).select('*').eq("email", rowData.email).maybeSingle();
        if (error) {
            throw error;
        }
        
        if (!data || !data?.email) {
            const { data: newUserData, error: insertError } = await supabase
              .from(table)
              .insert([{
                email: rowData.email,
                ...(!!rowData?.name && { name: rowData?.name }),
              }])
              .select();
            if (insertError) {
              throw insertError;
            }
            return newUserData;
        }
    },

    supabase_updateData: async (table, email, rowData) => {
        const { data, error } = await supabase
        .from(table)
        .update(rowData)
        .eq("email", email)
        .select()

        if (error) {
            throw error;
        }
    },

    getTableData: async (table) => {
        const { data } = await supabase
          .from(table)
          .select('*')
        return data;
    },

    getTableRow: async (table, row_name, row_id) => {
        const { data } = await supabase
          .from(table)
          .select('*').eq([row_name], row_id)
        return data;
    },

    updateRow: async(table, update_column, update_data, key_column, key_data) => {
        const { error } = await supabase
        .from(table)
        .update({[update_column]: update_data})
        .eq(key_column, key_data)

        if (error) {
            throw error;
        }
    },

    createTableRow: async (table, newRowData) => {
        console.log(newRowData)
        const { data, error } = await supabase
              .from(table)
              .insert(newRowData)
        if (error) {
            throw error;
        }
    },

    fetchCompliances: async () => {
        const { data } = await supabase
          .from(`certification`)
          .select('*')
        return data;
    },
    
    createCompliance: async (newRowData) => {
        const { data, error } = await supabase
              .from(`certification`)
              .insert({ certification: newRowData.certification, status: newRowData.status , due_date: newRowData.due_date , task_assigned: newRowData.task_assigned , checklist: newRowData.checklist })
        
        if (error) {
            throw error;
        }
    },

    fetchUserPermissions: async () => {
        const { data, error } = await supabase
            .from('user_permissions')
            .select(`
                id,
                role,
                status,
                access_till,
                user_id,
                assigned_by,
                user:user_id(id, email, name),
                assigned_user:assigned_by(id, name)
            `);
        if (error) {
            throw error;
        }
        return data;
    },

    fetchAllUsers: async () => {
        const { data, error } = await supabase
            .from('users')
            .select('id, name, email');
        if (error) {
            throw error;
        }
        return data;
    },

    fetchFacilities: async () => {
        const { data, error } = await supabase
            .from('facility')
            .select('facility_id, facility_name');
        if (error) {
            throw error;
        }
        return data;
    },

    fetchProcesses: async (facilityId) => {
        const { data, error } = await supabase
            .from('process')
            .select('process_id, process_name')
            .eq('facility_id', facilityId);
        if (error) {
            throw error;
        }
        return data;
    },

    fetchParameters: async () => {
        const { data, error } = await supabase
            .from('parameter')
            .select('para_id, para_name');
        if (error) {
            throw error;
        }
        return data;
    },

    fetchUserAccessData: async (userId) => {
        const { data, error } = await supabase
            .from('user_data_access')
            .select(`
                *,
                process:process_id (
                    process_name,
                    facility:facility_id (
                        facility_name
                    )
                ),
                parameter:parameter_id (
                    para_name
                )
            `)
            .eq('user_id', userId);
        if (error) {
            throw error;
        }
        return data;
    },

    // Add user permission
    createUserPermission: async (UserPermission) => {
        const { data, error } = await supabase
            .from('user_permissions')
            .insert([UserPermission])
            .select('*');
        if (error) {
            throw error;
        }
        return data;
    },

    // Update User permission
    updateUserPermission: async (UserId, UserRole) => {
        const { data, error } = await supabase
        .from('user_permissions')
        .update({'role': UserRole})
        .eq('user_id', UserId);

        if (error) {
            throw error;
        }
        return data;
    },

    // Function to deactivate user
    deactivateUser: async (UserID) => {
        const { data, error } = await supabase
            .from('users')
            .update({is_active: false})
            .eq('id', UserID);
        if (error) {
            throw error;
        }
        return data;
    },

       // Function to get user ID from the email
       getUserIdFromEmail: async (user_email) => {
        const { data, error } = await supabase
            .from('users')
            .select('id')
            .eq('email', user_email);
        if (error) {
            throw error;
        }
        return data;
    },

    fetchSuppliers: async () => {
        const { data } = await supabase
          .from(`supplier_management`)
          .select('*')
        return data; 
    },

    createSupplier: async (newRowData) => {
        const {data, error} = await supabase
          .from(`supplier_management`)
          .insert({ supplier_name: newRowData.supplier_name, location: newRowData.location , key_product: newRowData.key_product , sustainability_score: newRowData.sustainability_score , key_contact: newRowData.key_contact , key_email: newRowData.key_email })
        
        if (error) {
            throw error;
        }
    },

    fetchSupplierAnalytics: async (supplier) => {
        const { data } = await supabase
            .from(`supplier_management`)
            .select('*')
            .eq('supplier_name', supplier)
        return data;
    },

    fetchSupplierProducts: async (supplierData) => {
        const { data } = await supabase
            .from(`supplier_products`)
            .select('*')
            .eq('supplier_id', supplierData.id)
        return data;
    },

    fetchSupplierCertificates: async (supplierData) => {
        const { data } = await supabase
            .from(`supplier_certificates`)
            .select('*')
            .eq('supplier_id', supplierData.id)
        return data;
    },

    createSupplierCertificate: async (newCert, supplierData) => {
        const {data, error} = await supabase
            .from(`supplier_certificates`)
            .insert({ 
                certificate_name: newCert.certificate_name,
                status: newCert.status , expiration: newCert.expiration,
                last_audited: newCert.last_audited,
                link: newCert.link , notes: newCert.notes,
                supplier_id: supplierData.id
            });

        if (error) {
            throw error;
        }
    },

    editSupplierCertificate: async (certRowData) => {
        const {data, error} = await supabase
            .from('supplier_certificates')
            .update({
                certificate_name: certRowData.certificate_name,
                status: certRowData.status,
                expiration: certRowData.expiration,
                last_audited: certRowData.last_audited,
                link: certRowData.link,
                notes: certRowData.notes,
            })
            .eq('id', certRowData.id);
        
        if (error) {
            throw error;
        }
    },

    createSupplierProduct: async (newProd, supplierData) => {
        const { data, error } = await supabase
            .from('supplier_products')
            .insert({ 
                product_name: newProd.product_name, 
                serial_number: newProd.serial_number, 
                last_exported: newProd.last_exported, 
                volume: newProd.volume,
                supplier_id: supplierData.id,
            });

        if (error) {
            throw error;
        }
    },

    editSupplierProduct: async (prodRowData) => {
        const {data, error} = await supabase
            .from('supplier_products')
            .update({
                product_name: prodRowData.product_name,
                serial_number: prodRowData.serial_number,
                last_exported: prodRowData.last_exported,
                volume: prodRowData.volume
            })
            .eq('id', prodRowData.id);
        
        if (error) {
            throw error;
        }
    },

    validateData: (data, fields) => {
        const errors = {};
        fields.forEach(field => {
            const value = data[field.id];
            if (!value) {
                errors[field.id] = `${field.label} is required`;
            } else {
                switch (field.type) {
                    case 'email':
                        if (!/\S+@\S+\.\S+/.test(value)) {
                            errors[field.id] = `${field.label} is invalid`;
                        }
                        break;
                    case 'date':
                        if (isNaN(Date.parse(value))) {
                            errors[field.id] = `${field.label} is not a valid date`;
                        }
                        break;
                    case 'number':
                        if (isNaN(value)) {
                            errors[field.id] = `${field.label} must be a number`;
                        }
                        break;
                    default:
                        break;
                }
            }
        });
        return errors;
    },

    createCompany: async (comapnyData) => {
        const { data, error } = await supabase
            .from('company')
            .insert({ 
                company_id: comapnyData.company_id, 
                name: comapnyData.name, 
            });

        if (error) {
            throw error;
        }
    },
    
}
