import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Clock, MapPin, Users } from 'lucide-react';
import { LanguageExchangePartner } from '@/types/languageExchange';

interface LanguageExchangeProps {
  user: {
    id: string;
    name: string;
    language: string;
    location: string;
    availability: string;
    bio: string;
  };
}

export function LanguageExchange({ user }: LanguageExchangeProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [partners, setPartners] = useState<LanguageExchangePartner[]>([]);

  const handleSearch = () => {
    // Implement search logic using Firebase
    // This will be implemented with Firebase queries
  };

  const handleConnect = (partnerId: string) => {
    // Implement connection logic
    // This will create a chat room between users
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Find Language Partners</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Input
                placeholder="Search by name or interests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Select
                value={selectedLanguage}
                onValueChange={setSelectedLanguage}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={selectedLocation}
                onValueChange={setSelectedLocation}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">France</SelectItem>
                  <SelectItem value="us">United States</SelectItem>
                  <SelectItem value="uk">United Kingdom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSearch}>
              Search Partners
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {partners.map((partner) => (
          <Card key={partner.id} className="p-4">
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={partner.avatarUrl} />
                <AvatarFallback>{partner.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{partner.name}</h3>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <MapPin className="h-4 w-4" />
                  <span>{partner.location}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  <span>{partner.availability}</span>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => handleConnect(partner.id)}
              >
                Connect
              </Button>
            </div>
            <p className="mt-2 text-sm text-gray-600">{partner.bio}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

