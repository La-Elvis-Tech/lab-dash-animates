
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Mock laboratory data
const initialLaboratoryData = {
  name: "Laboratório Central de Análises",
  cnpj: "12.345.678/0001-90",
  email: "contato@labcentral.com.br",
  phone: "(11) 3456-7890",
  address: "Av. Paulista, 1000 - Bela Vista, São Paulo - SP, 01310-100",
  description: "Laboratório especializado em análises clínicas com mais de 20 anos de experiência.",
  responsibleName: "Dr. Carlos Mendes",
  responsibleCRM: "CRM-SP 54321",
  logo: ""
};

const LaboratoryProfile = () => {
  const [laboratoryData, setLaboratoryData] = useState(initialLaboratoryData);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setLaboratoryData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // Here you would typically send data to an API
    toast({
      title: "Perfil atualizado",
      description: "As informações do laboratório foram atualizadas com sucesso."
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setLaboratoryData(initialLaboratoryData);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <Card className="border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl text-neutral-900 dark:text-neutral-100">
            Perfil do Laboratório
          </CardTitle>
          <CardDescription className="text-neutral-600 dark:text-neutral-300">
            Gerencie as informações do seu laboratório
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={laboratoryData.logo || ""} alt={laboratoryData.name} />
              <AvatarFallback className="bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 text-xl">
                {laboratoryData.name.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            {isEditing && (
              <div>
                <Button variant="outline" size="sm" className="border-neutral-200 dark:border-neutral-700">Alterar Logo</Button>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-neutral-900 dark:text-neutral-100">Nome do Laboratório</Label>
              <Input 
                id="name"
                name="name"
                value={laboratoryData.name}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={isEditing ? "border-neutral-200 dark:border-neutral-700" : "bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700"}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cnpj" className="text-neutral-900 dark:text-neutral-100">CNPJ</Label>
              <Input 
                id="cnpj"
                name="cnpj"
                value={laboratoryData.cnpj}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={isEditing ? "border-neutral-200 dark:border-neutral-700" : "bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700"}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-neutral-900 dark:text-neutral-100">Email</Label>
              <Input 
                id="email"
                name="email"
                type="email"
                value={laboratoryData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={isEditing ? "border-neutral-200 dark:border-neutral-700" : "bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700"}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-neutral-900 dark:text-neutral-100">Telefone</Label>
              <Input 
                id="phone"
                name="phone"
                value={laboratoryData.phone}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={isEditing ? "border-neutral-200 dark:border-neutral-700" : "bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700"}
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address" className="text-neutral-900 dark:text-neutral-100">Endereço</Label>
              <Input 
                id="address"
                name="address"
                value={laboratoryData.address}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={isEditing ? "border-neutral-200 dark:border-neutral-700" : "bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700"}
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description" className="text-neutral-900 dark:text-neutral-100">Descrição</Label>
              <Textarea 
                id="description"
                name="description"
                value={laboratoryData.description}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={isEditing ? "border-neutral-200 dark:border-neutral-700" : "bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700"}
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="responsibleName" className="text-neutral-900 dark:text-neutral-100">Responsável Técnico</Label>
              <Input 
                id="responsibleName"
                name="responsibleName"
                value={laboratoryData.responsibleName}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={isEditing ? "border-neutral-200 dark:border-neutral-700" : "bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700"}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="responsibleCRM" className="text-neutral-900 dark:text-neutral-100">CRM</Label>
              <Input 
                id="responsibleCRM"
                name="responsibleCRM"
                value={laboratoryData.responsibleCRM}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={isEditing ? "border-neutral-200 dark:border-neutral-700" : "bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700"}
              />
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-end gap-2 border-t border-neutral-200 dark:border-neutral-700 pt-4">
          {!isEditing ? (
            <Button 
              onClick={() => setIsEditing(true)}
              className="bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              Editar Perfil
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleCancel} className="border-neutral-200 dark:border-neutral-700">Cancelar</Button>
              <Button 
                onClick={handleSave}
                className="bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
              >
                Salvar Alterações
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default LaboratoryProfile;
