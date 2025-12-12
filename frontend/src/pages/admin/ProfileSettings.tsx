import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  VStack,
  Input,
  Button,
  Card,
  Field,
  Text,
} from '@chakra-ui/react';
import client from '../../api/client';
import { toaster } from '../../components/ui/toaster';

const ProfileSettings: React.FC = () => {
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
  });
  
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await client.get('/user');
      setProfileData({
        name: response.data.name,
        email: response.data.email,
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingProfile(true);
    try {
      await client.put('/admin/profile', profileData);
      toaster.create({
        title: 'Success',
        description: 'Profile updated successfully',
        type: 'success',
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toaster.create({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update profile',
        type: 'error',
      });
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingPassword(true);
    try {
      await client.put('/admin/profile/password', passwordData);
      toaster.create({
        title: 'Success',
        description: 'Password updated successfully',
        type: 'success',
      });
      setPasswordData({
        current_password: '',
        password: '',
        password_confirmation: '',
      });
    } catch (error: any) {
      console.error('Error updating password:', error);
      toaster.create({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update password',
        type: 'error',
      });
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <Box p={5} maxW="800px" mx="auto">
      <Heading mb={6}>Profile Settings</Heading>
      
      <VStack gap={8} align="stretch">
        {/* Profile Information */}
        <Card.Root>
          <Card.Header>
            <Heading size="md">Profile Information</Heading>
            <Text fontSize="sm" color="gray.500">Update your account's profile information and email address.</Text>
          </Card.Header>
          <Card.Body>
            <form onSubmit={handleUpdateProfile}>
              <VStack gap={4} align="stretch">
                <Field.Root required>
                  <Field.Label>Name</Field.Label>
                  <Input
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                  />
                </Field.Root>

                <Field.Root required>
                  <Field.Label>Email</Field.Label>
                  <Input
                    name="email"
                    type="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                  />
                </Field.Root>

                <Box>
                  <Button type="submit" colorPalette="blue" loading={loadingProfile}>
                    Save
                  </Button>
                </Box>
              </VStack>
            </form>
          </Card.Body>
        </Card.Root>

        {/* Update Password */}
        <Card.Root>
          <Card.Header>
            <Heading size="md">Update Password</Heading>
            <Text fontSize="sm" color="gray.500">Ensure your account is using a long, random password to stay secure.</Text>
          </Card.Header>
          <Card.Body>
            <form onSubmit={handleUpdatePassword}>
              <VStack gap={4} align="stretch">
                <Field.Root required>
                  <Field.Label>Current Password</Field.Label>
                  <Input
                    name="current_password"
                    type="password"
                    value={passwordData.current_password}
                    onChange={handlePasswordChange}
                  />
                </Field.Root>

                <Field.Root required>
                  <Field.Label>New Password</Field.Label>
                  <Input
                    name="password"
                    type="password"
                    value={passwordData.password}
                    onChange={handlePasswordChange}
                  />
                </Field.Root>

                <Field.Root required>
                  <Field.Label>Confirm Password</Field.Label>
                  <Input
                    name="password_confirmation"
                    type="password"
                    value={passwordData.password_confirmation}
                    onChange={handlePasswordChange}
                  />
                </Field.Root>

                <Box>
                  <Button type="submit" colorPalette="blue" loading={loadingPassword}>
                    Save
                  </Button>
                </Box>
              </VStack>
            </form>
          </Card.Body>
        </Card.Root>
      </VStack>
    </Box>
  );
};

export default ProfileSettings;
